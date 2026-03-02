"use client"

import { useAuth0 } from "@auth0/auth0-react"
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Modal,
  Snackbar,
  Stack,
  Typography
} from "@mui/material"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import {
  ActivityMetadataDto,
  OccurrenceType,
  QueryActivityDto,
  RegistrationType,
  UserType
} from "../../models/domainDtos"
import { CATEGORIES } from "../../data/categories"
import {
  createActivity,
  fetchActivity,
  getActivityMetadata,
  getSimilarActivities,
  updateActivity,
  uploadPhoto
} from "../../models/services/activities.service"
import { geocodeAddress } from "../../models/services/address.service"
import { revalidateActivity } from "../../app/actions"
import { Step1 } from "./steps/step1"
import { Step2 } from "./steps/step2"
import { Step3 } from "./steps/step3"
import { Step4 } from "./steps/step4"
import { Step5 } from "./steps/step5"
import { Step6 } from "./steps/step6"
import { Step7 } from "./steps/step7"

const initialActivity: QueryActivityDto = {
  base: {
    title: "",
    description: "",
    userType: UserType.Promotor,
    registration: RegistrationType.NotNeeded,
    price: 0,
    tags: "",
    occurrence: {
      type: OccurrenceType.Single
    },
    address: {
      streetAddress: ""
    }
  }
}

export const ActivityForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams?.get("editId") ?? null
  const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect } = useAuth0()
  const [activeStep, setActiveStep] = useState(editId ? 1 : 0)
  const [activitiesMetadata, setActivitiesMetadata] = useState<ActivityMetadataDto | undefined>(
    undefined
  )
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(!!editId)
  const [activity, setActivity] = useState<QueryActivityDto>(initialActivity)

  useEffect(() => {
    if (!editId) return
    setLoadingEdit(true)
    fetchActivity(editId).then(data => {
      if (data) {
        setActivity(data)
        setActiveStep(1)
      }
      setLoadingEdit(false)
    })
  }, [editId])
  const [pendingActivity, setPendingActivity] = useState<QueryActivityDto | null>(null)
  const [similarActivities, setSimilarActivities] = useState<QueryActivityDto[]>([])
  const [showSimilarModal, setShowSimilarModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const categories = CATEGORIES

  const handleLogin = () => {
    const returnTo = window.location.pathname + window.location.search
    localStorage.setItem("auth_return_to", returnTo)
    loginWithRedirect({ appState: { returnTo } })
  }

  if (isLoading || loadingEdit) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          padding: { xs: 1, md: 5 },
          paddingBottom: { xs: 0, md: 0 },
          width: "100%",
          maxWidth: "2500px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: "1 1 auto"
        }}
      >
        <Step1 activity={activity} submitButton={{ name: "Zaloguj się", action: handleLogin }} />
      </Box>
    )
  }

  const similarModalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: 600,
    width: "90%",
    bgcolor: "#ffffff",
    border: "none",
    borderRadius: { xs: 4, md: 8 },
    boxShadow: 24,
    p: 2
  }

  const backButton = {
    name: "powrót",
    action: (a: QueryActivityDto) => {
      setActivity(a)
      setActiveStep(activeStep - 1)
    }
  }

  const nextButton = {
    name: "Dalej",
    action: async (a: QueryActivityDto) => {
      if (activeStep === 1 && a.base.title && a.base.description) {
        setActivitiesMetadata(undefined)
        setLoadingMetadata(true)
        try {
          const token = await getAccessTokenSilently()
          const metadata = await getActivityMetadata(a.base.title, a.base.description, token)
          if (metadata) {
            let fullAddress = undefined
            if (metadata.address) {
              try {
                fullAddress = await geocodeAddress(metadata.address)
              } catch {
                // ignore geocode error
              }
            }
            setActivitiesMetadata({ ...metadata, fullAddress })
          }
        } catch {
          setActivitiesMetadata(undefined)
        } finally {
          setLoadingMetadata(false)
        }
      }
      setActivity(a)
      setActiveStep(activeStep + 1)
    }
  }

  const createButton = {
    name: editId ? "zapisz zmiany" : "publikuj",
    action: async (a: QueryActivityDto) => {
      const aToSend = {
        ...activity,
        ...a
      } as QueryActivityDto

      setCreating(true)
      try {
        const token = await getAccessTokenSilently()

        if (editId) {
          try {
            const success = await updateActivity(editId, aToSend, token)
            if (success) {
              await revalidateActivity(editId)
              router.push(`/wydarzenia/${editId}`)
            } else {
              setErrorMessage("Nie udało się zapisać zmian.")
            }
          } catch {
            setErrorMessage("Wystąpił błąd podczas zapisywania zmian.")
          }
          return
        }

        const similar = await getSimilarActivities(aToSend, token)
        if (similar.length > 0) {
          setPendingActivity(aToSend)
          setSimilarActivities(similar)
          setShowSimilarModal(true)
          setCreating(false)
          return
        }

        await doCreate(aToSend, token)
      } catch (e) {
        console.error("Create activity error:", e)
      } finally {
        setCreating(false)
      }
    }
  }

  const doCreate = async (activityToCreate: QueryActivityDto, token: string) => {
    const result = await createActivity(activityToCreate, token)
    if (result) {
      const activityId = (result as any).id || (result as any).activityId
      if (activityId && activityToCreate.photos) {
        const photoWithFile = activityToCreate.photos.find(p => p.file)
        if (photoWithFile?.file) {
          await uploadPhoto(photoWithFile.file, activityId, token)
        }
      }
      router.push("/my-activities")
    }
  }

  const createPendingActivity = async () => {
    if (!pendingActivity) return
    setCreating(true)
    try {
      const token = await getAccessTokenSilently()
      await doCreate(pendingActivity, token)
    } catch (e) {
      console.error(e)
    } finally {
      setShowSimilarModal(false)
      setPendingActivity(null)
      setCreating(false)
    }
  }

  const steps = [
    {
      name: "Welcome",
      component: <Step1 activity={activity} submitButton={nextButton} />
    },
    {
      name: "Description",
      component: (
        <Step2
          activity={activity}
          cancelButton={backButton}
          submitButton={nextButton}
          loading={loadingMetadata}
        />
      )
    },
    {
      name: "Address",
      component: (
        <Step3
          activity={activity}
          cancelButton={backButton}
          submitButton={nextButton}
          metadata={activitiesMetadata}
        />
      )
    },
    {
      name: "Image",
      component: (
        <Step4
          activity={activity}
          cancelButton={backButton}
          submitButton={nextButton}
          metadata={activitiesMetadata}
          categories={categories}
        />
      )
    },
    {
      name: "Time",
      component: (
        <Step5
          activity={activity}
          cancelButton={backButton}
          submitButton={nextButton}
          metadata={activitiesMetadata}
        />
      )
    },
    {
      name: "Categories",
      component: (
        <Step6
          activity={activity}
          cancelButton={backButton}
          submitButton={nextButton}
          metadata={activitiesMetadata}
          categories={categories}
        />
      )
    },
    {
      name: "Summary",
      component: <Step7 activity={activity} cancelButton={backButton} submitButton={createButton} />
    }
  ]

  return (
    <Box
      sx={{
        padding: { xs: 1, md: 5 },
        paddingBottom: { xs: 0, md: 0 },
        width: "100%",
        maxWidth: "2500px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "1 1 auto"
      }}
    >
      {creating && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.7)",
            zIndex: 100
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {steps[activeStep].component}
      <Modal open={showSimilarModal} onClose={() => setShowSimilarModal(false)}>
        <Box sx={similarModalStyle}>
          <Typography variant="h6" gutterBottom>
            Znaleziono podobne aktywności
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Wygląda na to, że taka aktywność już istnieje! <br />
            Możesz ją promować, klikając <ThumbUpAltIcon sx={{ verticalAlign: "middle" }} />, albo
            zgłosić błąd, jeśli coś warto poprawić.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              overflowX: "auto",
              flexWrap: "nowrap",
              pb: 1
            }}
          >
            {similarActivities.map(a => (
              <Box
                key={a.id}
                sx={{
                  minWidth: "200px",
                  p: 1,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  cursor: "pointer"
                }}
                onClick={() => router.push(`/wydarzenia/${a.id}`)}
              >
                <Typography variant="subtitle2">{a.base.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {a.base.address.streetAddress}
                </Typography>
              </Box>
            ))}
          </Box>
          <Stack direction="row" spacing={2} width="100%" justifyContent="space-around">
            <Button variant="contained" color="warning" onClick={createPendingActivity}>
              Stwórz mimo to
            </Button>
            <Button variant="outlined" color="warning" onClick={() => setShowSimilarModal(false)}>
              wróć do formularza
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

import type { CategoryDto } from "models/dtos/GetCategoriesQueryResponse"

export const CATEGORIES: CategoryDto[] = [
  {
    id: "1",
    label: "Rozrywka",
    mainCategory: "1",
    children: [
      {
        id: "110",
        label: "Imprezy i życie nocne",
        mainCategory: "1",
        children: [
          { id: "111", label: "Imprezy klubowe i taneczne", mainCategory: "1", children: null },
          { id: "112", label: "Koncerty klubowe i live music", mainCategory: "1", children: null },
          { id: "113", label: "Wieczory tematyczne", mainCategory: "1", children: null },
          { id: "114", label: "Spotkania towarzyskie i puby", mainCategory: "1", children: null },
          { id: "119", label: "Imprezy i życie nocne - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "120",
        label: "Warsztaty i kursy",
        mainCategory: "1",
        children: [
          { id: "121", label: "Biznes, marketing i finanse", mainCategory: "1", children: null },
          {
            id: "122",
            label: "Rozwój zawodowy i kompetencje miękkie",
            mainCategory: "1",
            children: null
          },
          { id: "123", label: "Rozwój osobisty i duchowość", mainCategory: "1", children: null },
          {
            id: "124",
            label: "Technologia, IT i programowanie",
            mainCategory: "1",
            children: null
          },
          { id: "125", label: "Kulinaria i degustacje", mainCategory: "1", children: null },
          { id: "126", label: "Zdrowie, uroda i styl", mainCategory: "1", children: null },
          { id: "127", label: "Rękodzieło i sztuka", mainCategory: "1", children: null },
          {
            id: "128",
            label: "Hobby techniczne i kolekcjonerstwo",
            mainCategory: "1",
            children: null
          },
          { id: "129", label: "Warsztaty i kursy - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "130",
        label: "Relaks i wellness",
        mainCategory: "1",
        children: [
          { id: "131", label: "SPA i sauny", mainCategory: "1", children: null },
          { id: "132", label: "Masaże i zabiegi", mainCategory: "1", children: null },
          { id: "133", label: "Medytacja i joga relaksacyjna", mainCategory: "1", children: null },
          { id: "139", label: "Relaks i wellness - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "140",
        label: "Turystyka i odkrywanie",
        mainCategory: "1",
        children: [
          {
            id: "141",
            label: "Zorganizowane wycieczki i zwiedzanie",
            mainCategory: "1",
            children: null
          },
          {
            id: "142",
            label: "Zabytki, architektura i punkty widokowe",
            mainCategory: "1",
            children: null
          },
          { id: "143", label: "Rekreacja na świeżym powietrzu", mainCategory: "1", children: null },
          { id: "144", label: "Parki, ogrody i przyroda", mainCategory: "1", children: null },
          { id: "149", label: "Turystyka i odkrywanie - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "150",
        label: "Festiwale, targi i jarmarki",
        mainCategory: "1",
        children: [
          {
            id: "151",
            label: "Festiwale muzyczne i artystyczne",
            mainCategory: "1",
            children: null
          },
          { id: "152", label: "Targi konsumenckie i lifestyle", mainCategory: "1", children: null },
          { id: "153", label: "Targi branżowe i biznesowe", mainCategory: "1", children: null },
          {
            id: "154",
            label: "Jarmarki, festyny i wydarzenia lokalne",
            mainCategory: "1",
            children: null
          },
          { id: "155", label: "Konwenty i zloty pasjonatów", mainCategory: "1", children: null },
          {
            id: "159",
            label: "Festiwale, targi i jarmarki - inne",
            mainCategory: "1",
            children: null
          }
        ]
      },
      {
        id: "160",
        label: "Gry i zabawy",
        mainCategory: "1",
        children: [
          {
            id: "161",
            label: "Gry planszowe, karciane i logiczne",
            mainCategory: "1",
            children: null
          },
          { id: "162", label: "Escape roomy i VR", mainCategory: "1", children: null },
          { id: "163", label: "Gry terenowe i miejskie", mainCategory: "1", children: null },
          { id: "164", label: "Paintball i laser tag", mainCategory: "1", children: null },
          { id: "165", label: "Kręgielnie, bilard i rzutki", mainCategory: "1", children: null },
          { id: "169", label: "Gry i zabawy - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "170",
        label: "Wystawy i muzea",
        mainCategory: "1",
        children: [
          { id: "171", label: "Sztuka i fotografia", mainCategory: "1", children: null },
          { id: "172", label: "Historia i kultura", mainCategory: "1", children: null },
          { id: "173", label: "Nauka i technika", mainCategory: "1", children: null },
          { id: "179", label: "Wystawy i muzea - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "180",
        label: "Scena i ekran",
        mainCategory: "1",
        children: [
          { id: "181", label: "Koncerty i muzyka", mainCategory: "1", children: null },
          { id: "182", label: "Teatr, opera i spektakle", mainCategory: "1", children: null },
          { id: "183", label: "Kabaret i stand-up", mainCategory: "1", children: null },
          { id: "184", label: "Kino i seanse filmowe", mainCategory: "1", children: null },
          { id: "189", label: "Scena i ekran - inne", mainCategory: "1", children: null }
        ]
      },
      {
        id: "190",
        label: "Spotkania i społeczność",
        mainCategory: "1",
        children: [
          {
            id: "191",
            label: "Spotkania hobbystyczne i fankluby",
            mainCategory: "1",
            children: null
          },
          {
            id: "192",
            label: "Wykłady i prelekcje popularnonaukowe",
            mainCategory: "1",
            children: null
          },
          { id: "193", label: "Networking i spotkania otwarte", mainCategory: "1", children: null },
          {
            id: "194",
            label: "Spotkania branżowe i specjalistyczne",
            mainCategory: "1",
            children: null
          },
          {
            id: "195",
            label: "Spotkania towarzyskie i randkowe",
            mainCategory: "1",
            children: null
          },
          {
            id: "199",
            label: "Spotkania i społeczność - inne",
            mainCategory: "1",
            children: null
          }
        ]
      }
    ]
  },
  {
    id: "2",
    label: "Sport",
    mainCategory: "2",
    children: [
      {
        id: "210",
        label: "Sporty zespołowe",
        mainCategory: "2",
        children: [
          { id: "211", label: "Piłka nożna", mainCategory: "2", children: null },
          { id: "212", label: "Siatkówka", mainCategory: "2", children: null },
          { id: "213", label: "Koszykówka", mainCategory: "2", children: null },
          { id: "214", label: "Piłka ręczna", mainCategory: "2", children: null },
          { id: "219", label: "Sporty zespołowe - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "220",
        label: "Sporty rakietowe",
        mainCategory: "2",
        children: [
          { id: "221", label: "Tenis ziemny", mainCategory: "2", children: null },
          { id: "222", label: "Squash", mainCategory: "2", children: null },
          { id: "223", label: "Tenis stołowy", mainCategory: "2", children: null },
          { id: "224", label: "Padel", mainCategory: "2", children: null },
          { id: "225", label: "Badminton", mainCategory: "2", children: null },
          { id: "229", label: "Sporty rakietowe - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "230",
        label: "Sporty wodne",
        mainCategory: "2",
        children: [
          { id: "231", label: "Pływanie", mainCategory: "2", children: null },
          { id: "232", label: "Kajaki, SUP i wioślarstwo", mainCategory: "2", children: null },
          { id: "233", label: "Żeglarstwo i windsurfing", mainCategory: "2", children: null },
          { id: "239", label: "Sporty wodne - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "240",
        label: "Sporty wytrzymałościowe",
        mainCategory: "2",
        children: [
          { id: "241", label: "Bieganie", mainCategory: "2", children: null },
          { id: "242", label: "Kolarstwo", mainCategory: "2", children: null },
          { id: "243", label: "Triathlon", mainCategory: "2", children: null },
          { id: "244", label: "Nordic walking", mainCategory: "2", children: null },
          {
            id: "249",
            label: "Sporty wytrzymałościowe - inne",
            mainCategory: "2",
            children: null
          }
        ]
      },
      {
        id: "250",
        label: "Taniec i akrobatyka",
        mainCategory: "2",
        children: [
          { id: "251", label: "Taniec w parach i social", mainCategory: "2", children: null },
          {
            id: "252",
            label: "Street Dance, Hip-Hop i K-Pop",
            mainCategory: "2",
            children: null
          },
          { id: "253", label: "Taniec Artystyczny i Balet", mainCategory: "2", children: null },
          { id: "254", label: "Pole Dance i Akrobatyka", mainCategory: "2", children: null },
          { id: "259", label: "Taniec i akrobatyka - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "260",
        label: "Sztuki walki",
        mainCategory: "2",
        children: [
          {
            id: "261",
            label: "Boks, Kick-boxing i Muay Thai",
            mainCategory: "2",
            children: null
          },
          { id: "262", label: "BJJ, Judo i Zapasy", mainCategory: "2", children: null },
          { id: "263", label: "MMA (Mieszane sztuki walki)", mainCategory: "2", children: null },
          {
            id: "264",
            label: "Karate, Taekwondo i Tradycyjne",
            mainCategory: "2",
            children: null
          },
          { id: "265", label: "Samoobrona i Krav Maga", mainCategory: "2", children: null },
          { id: "269", label: "Sztuki walki - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "270",
        label: "Siłownia i fitness",
        mainCategory: "2",
        children: [
          { id: "271", label: "Siłownia i kulturystyka", mainCategory: "2", children: null },
          { id: "272", label: "Zajęcia fitness i aerobik", mainCategory: "2", children: null },
          { id: "273", label: "Joga i pilates", mainCategory: "2", children: null },
          {
            id: "274",
            label: "Trening funkcjonalny i CrossFit",
            mainCategory: "2",
            children: null
          },
          { id: "279", label: "Siłownia i fitness - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "280",
        label: "Sporty ekstremalne i miejskie",
        mainCategory: "2",
        children: [
          { id: "281", label: "Wspinaczka i parki linowe", mainCategory: "2", children: null },
          {
            id: "282",
            label: "Skateboarding, rolki i wrotki",
            mainCategory: "2",
            children: null
          },
          { id: "283", label: "Sporty motorowe", mainCategory: "2", children: null },
          { id: "289", label: "Sporty ekstremalne - inne", mainCategory: "2", children: null }
        ]
      },
      {
        id: "290",
        label: "Inne sporty",
        mainCategory: "2",
        children: [
          { id: "291", label: "Bilard, kręgle i rzutki", mainCategory: "2", children: null },
          { id: "292", label: "Sporty zimowe", mainCategory: "2", children: null },
          { id: "293", label: "Jeździectwo", mainCategory: "2", children: null },
          {
            id: "294",
            label: "Strzelectwo, łucznictwo i paintball sportowy",
            mainCategory: "2",
            children: null
          },
          { id: "295", label: "Sporty umysłowe", mainCategory: "2", children: null },
          { id: "296", label: "Wędkarstwo", mainCategory: "2", children: null },
          { id: "297", label: "Golf i minigolf", mainCategory: "2", children: null },
          { id: "299", label: "Pozostałe sporty", mainCategory: "2", children: null }
        ]
      },
      {
        id: "298",
        label: "Sport dla kibiców",
        mainCategory: "2",
        children: null
      }
    ]
  },
  {
    id: "3",
    label: "Dla dzieci",
    mainCategory: "3",
    children: [
      { id: "301", label: "Edukacja i kreatywność", mainCategory: "3", children: null },
      { id: "302", label: "Przedstawienia i pokazy", mainCategory: "3", children: null },
      { id: "303", label: "Sport i aktywność fizyczna", mainCategory: "3", children: null },
      { id: "304", label: "Place zabaw i centra rozrywki", mainCategory: "3", children: null },
      { id: "305", label: "Przyroda i zwierzęta", mainCategory: "3", children: null },
      { id: "306", label: "Rozwój i terapia", mainCategory: "3", children: null },
      { id: "307", label: "Zajęcia zorganizowane i opieka", mainCategory: "3", children: null },
      {
        id: "308",
        label: "Wydarzenia rodzinne i okolicznościowe",
        mainCategory: "3",
        children: null
      }
    ]
  }
]

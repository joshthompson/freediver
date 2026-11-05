import {
  captainChumDialogAsset,
  cowDialogAsset,
  demonCorgiFishAsset,
  devilCorgiFishAsset,
  devilCorgiFishHappyAsset,
  eggyCorgiDialogAsset,
  hellCorgiDialogAsset,
  judgeCorgiDialogAsset,
  kingDialogAsset,
  linkDialogAsset,
  manateeHappyDialogAsset,
  manateeSadDialogAsset,
  scrambledEggMonsterAsset,
  scrambledEggMonsterHappyAsset,
  spaceCorgiDialogAsset,
} from '@/assets'
import { DialogMessage, Localised, SpeechSound } from '@/utils/game'
import { RealmName } from './Realms'

// Every line in English, Russian, Swedish and Fvelyntari
const say = (en: string, ru: string, sv: string, fl: string): Localised => ({ en, ru, sv, fl })

// How a character sounds as their lines type out: their pitch in Hz, the wave, and how each beep bends
const speech = (pitch: number, wave: OscillatorType, slide?: number, volume?: number): SpeechSound => ({ pitch, wave, slide, volume })

const woof = say('Woof woof!', 'Гав-гав!', 'Voff voff!', 'Wuf wuf!')
const woofQuestion = say('Woof?', 'Гав?', 'Voff?', 'Wuf?')

const cow = { speaker: say('Wanda the Cow', 'Корова Ванда', 'Kossan Wanda', 'Wanda Kavur'), image: cowDialogAsset, speechSound: speech(150, 'sawtooth', 0.8) }
const link = { speaker: say('Linkosha', 'Линкоша', 'Linkosha', 'Linkosha'), image: linkDialogAsset, speechSound: speech(640, 'square', 1.2) }
const manateeSad = { speaker: say('Manny the Manatee', 'Ламантин Мэнни', 'Manaten Manny', 'Manny Morvakel'), image: manateeSadDialogAsset, speechSound: speech(115, 'sine', 0.9) }
const manateeHappy = { ...manateeSad, image: manateeHappyDialogAsset }
const king = { speaker: say('The Corgi King', 'Король Корги', 'Corgikungen', 'Korli Kalun'), image: kingDialogAsset, speechSound: speech(210, 'triangle', 1, 2) }
// Realm Guide names are placeholders until they're named properly
const cosmo = { speaker: say('Cosmo the Space Corgi', 'Космо, космический корги', 'Rymdcorgin Cosmo', 'Cosmo Estrel-korli'), image: spaceCorgiDialogAsset, speechSound: speech(720, 'sine', 1.4) }
const chum = { speaker: say('Captain Chum', 'Капитан Прикорм', 'Kapten Agn', 'Kaptal Chum'), image: captainChumDialogAsset, speechSound: speech(175, 'sawtooth') }
const yolko = { speaker: say('Yolko the Eggy Corgi', 'Желток, яичный корги', 'Äggcorgin Yolko', 'Yolko Esh-korli'), image: eggyCorgiDialogAsset, speechSound: speech(900, 'square', 1.25) }
const fathom = { speaker: say('Judge Fathom', 'Судья Глубин', 'Domare Famn', 'Drekun Fathom'), image: judgeCorgiDialogAsset, speechSound: speech(300, 'sine') }
const ember = { speaker: say('Ember', 'Уголёк', 'Glöd', 'Ember'), image: hellCorgiDialogAsset, speechSound: speech(430, 'sawtooth', 1.1) }
const eggMonster = { speaker: say('The Scrambled Egg Monster', 'Монстр-Омлет', 'Äggröremonstret', 'Eshrova Morgul'), image: scrambledEggMonsterAsset, speechSound: speech(95, 'sawtooth', 0.6) }
const eggMonsterHappy = { ...eggMonster, image: scrambledEggMonsterHappyAsset }
const demon = { speaker: say('The Demon Corgi Fish', 'Демон корги-рыба', 'Demoncorgifisken', 'Vashkur Korlishol'), image: demonCorgiFishAsset, speechSound: speech(520, 'sawtooth', 0.75) }
const devil = { speaker: say('The Devil Corgi Fish', 'Дьявольская корги-рыба', 'Djävulscorgifisken', 'Vashkalun Korlishol'), image: devilCorgiFishAsset, speechSound: speech(70, 'sawtooth', 0.7) }
const devilFriend = { ...devil, image: devilCorgiFishHappyAsset }

export const CowQuest = {
  intro: [
    { ...cow, text: say('Moooooooo!', 'Мууууууу!', 'Muuuuuuu!', 'Muuuuuuu!') },
    { ...cow, text: say(
      `My name is Wanda the Cow and I'm in a really bad mooood`,
      'Меня зовут корова Ванда, и у меня ужасное мууунастроение',
      'Jag heter Kossan Wanda och jag är på riktigt dåligt muuuhumör',
      'Shon Wanda Kavur, vä mel losh muuurin',
    ) },
    { ...link, text: woof },
    { ...cow, text: say('You really want to help me?!', 'Ты правда хочешь мне помочь?!', 'Vill du verkligen hjälpa mig?!', 'Shon telvä melnor?!') },
    { ...link, text: woof },
    { ...cow, text: say(
      'So I got separated from my cousin the sea-cow. Could you help reunite us?',
      'Я потерялась со своей кузиной, морской коровой. Поможешь нам снова встретиться?',
      'Jag kom bort från min kusin sjökon. Kan du hjälpa oss att hitta varandra igen?',
      'Mel naril-nel kushel morva-kavur. Shon talvor vä?',
    ) },
    { ...link, text: woof },
    { ...cow, text: say(
      `Wow, your kindness has really moooved me!`,
      'Ух ты, твоя доброта меня так мууутрогала!',
      'Wow, din vänlighet har verkligen muuurt mig!',
      'Ooh, shon telvä muuuvor mel!',
    ) },
    { ...link, text: woof },
    { ...cow, text: say(
      `I'll try and keep up with you but I'm not the fastest swimmer`,
      'Я постараюсь не отставать, но плаваю я не очень быстро',
      'Jag ska försöka hänga med, men jag simmar inte så fort',
      'Mel shavor drel shon, nel mel shavoren losh',
    ) },
  ],
  preQuestManatee: [
    { ...manateeSad, text: say(
      'Mwoorp, I lost my cousin somewhere. Mwoorp!',
      'Мвурп, я где-то потерял свою кузину. Мвурп!',
      'Mwoorp, jag har tappat bort min kusin. Mwoorp!',
      'Mwoorp, mel naril-nel kushel. Mwoorp!',
    ) },
  ],
  slowDown: [
    { ...cow, text: say(`Slow down, I've lost you!`, 'Помедленнее, я тебя потеряла!', 'Sakta ner, jag har tappat bort dig!', 'Losh-shavor, mel naril-nel shon!') },
  ],
  foundYou: [
    { ...cow, text: say(`Ahhh, there you are!`, 'Ааа, вот ты где!', 'Ååh, där är du!', 'Aaah, shon tal!') },
  ],
  halfWay: [
    { ...cow, text: say(
      `I think I recognise those crabs, let's keep going this way!`,
      'Кажется, я узнаю этих крабов, плывём дальше сюда!',
      'Jag tror jag känner igen de där krabborna, vi fortsätter hitåt!',
      'Mel varil krabel, shavoren drel!',
    ) },
  ],
  reunion: [
    { ...manateeHappy, text: say('Mwoorp?', 'Мвурп?', 'Mwoorp?', 'Mwoorp?') },
    { ...cow, text: say('Mooooo!', 'Муууу!', 'Muuuu!', 'Muuuu!') },
    { ...manateeHappy, text: say('Mwoooorrrp!!!', 'Мвуууурррп!!!', 'Mwoooorrrp!!!', 'Mwoooorrrp!!!') },
    { ...cow, text: say(`Manny! It's really you!`, 'Мэнни! Это правда ты!', 'Manny! Det är verkligen du!', 'Manny! Shon tal!') },
    { ...cow, text: say(
      'Thank you for helping! Linkosha, you are legen-dairy!',
      'Спасибо за помощь! Линкоша, ты просто легендарно-молочный!',
      'Tack för hjälpen! Linkosha, du är leg-mjölk-darisk!',
      'Telvor! Linkosha, shon lorva-kavurin!',
    ) },
    { ...link, text: woof },
    { ...manateeHappy, text: say(
      'I was hiding in my cave, but to say thank you, maybe I can let you swim through it?',
      'Я прятался в своей пещере, но в благодарность могу пропустить тебя через неё.',
      'Jag gömde mig i min grotta, men som tack kanske du får simma igenom den?',
      'Mel nerval tal grotul, telvor, shon shavoren drel?',
    ) },
    { ...link, text: woof },
  ],
} as const satisfies Record<string, DialogMessage[]>

// TODO: Placeholder lines until they're rewritten
export const BackgroundDialogLines = {
  cow: [
    say('Moo-rning, Linkosha!', 'Мууутро доброе, Линкоша!', 'God muuurgon, Linkosha!', 'Muuurin, Linkosha!'),
    say('Hay there, pup!', 'Сенно приветствую, щенок!', 'Hö där, valpen!', 'Hö tal, korli!'),
    say('Manny and I are having a whale of a time!', 'Нам с Мэнни китово весело!', 'Manny och jag har en valig tid!', 'Manny vä mel morva-lerosh!'),
    say('What an udderly lovely day for a swim!', 'Вымя-нительный денёк для заплыва!', 'Vilken juverlig dag för ett dopp!', 'Kavur-lerosh talun for shavoren!'),
  ],
  manatee: [
    say('Mwoorp! Hello again!', 'Мвурп! Снова привет!', 'Mwoorp! Hej igen!', 'Mwoorp! Hela neren!'),
    say('Mwoorp mwoorp!', 'Мвурп-мвурп!', 'Mwoorp mwoorp!', 'Mwoorp mwoorp!'),
    say('Thanks again, little pup!', 'Ещё раз спасибо, малыш!', 'Tack igen, lilla valp!', 'Telvor neren, korli!'),
    say('Sea-cows never forget a friend. Mwoorp!', 'Морские коровы никогда не забывают друзей. Мвурп!', 'Sjökor glömmer aldrig en vän. Mwoorp!', 'Morva-kavur nel varil-nel shonari. Mwoorp!'),
  ],
} as const satisfies Record<string, readonly Localised[]>

// TODO: Placeholder quest text until the king's quest is written
export const KingQuest = {
  intro: [
    { ...king, text: say(
      'Who dares swim into the Corgi Kingdom?',
      'Кто смеет заплывать в Королевство Корги?',
      'Vem vågar simma in i Corgiriket?',
      'Varil shavoren tal Korli Kalunra?',
    ) },
    { ...link, text: woof },
    { ...king, text: say(
      'Linkosha! Welcome, brave pup. You have come at just the right time.',
      'Линкоша! Добро пожаловать, храбрый щенок. Ты пришёл как раз вовремя.',
      'Linkosha! Välkommen, modiga valp. Du kommer precis i rätt tid.',
      'Linkosha! Hela, vorli korli. Shon tal talun.',
    ) },
    { ...king, text: say('Link, I have a royal quest for you.', 'Линк, у меня для тебя королевское задание.', 'Link, jag har ett kungligt uppdrag åt dig.', 'Link, mel drevok kalun for shon.') },
    { ...king, text: say(
      'I need you to bring me the 5 crystal corgis.',
      'Мне нужно, чтобы ты принёс мне 5 хрустальных корги.',
      'Jag behöver att du hämtar de 5 kristallcorgisarna åt mig.',
      'Shon naril 5 kristal korli ta mel.',
    ) },
    { ...link, text: woof },
    { ...king, text: say(
      'Link, return to me when it is done, and you shall be rewarded!',
      'Линк, возвращайся, когда закончишь, и будешь награждён!',
      'Link, kom tillbaka till mig när det är klart, så ska du bli belönad!',
      'Link, renvor ta mel, vä shon telvin!',
    ) },
  ],
} as const satisfies Record<string, DialogMessage[]>

// Background Dialog from the king while his quest is under way
export const KingReminderBackgroundDialogLines = [
  say(
    'Link, have you completed my royal quest yet?',
    'Линк, ты уже выполнил моё королевское задание?',
    'Link, har du slutfört mitt kungliga uppdrag än?',
    'Link, shon drevok kalun tal?',
  ),
] as const

export const KingDeliveries = {
  // When a Crystal Corgi is set on its Plinth
  delivered: {
    corgosphere: [
      { ...king, text: say(
        'The Ruby Crystal Corgi! You braved the stars themselves!',
        'Рубиновый Хрустальный Корги! Ты бросил вызов самим звёздам!',
        'Rubinkristallcorgin! Du trotsade själva stjärnorna!',
        'Rubin Korli! Shon vorli tal estrel!',
      ) },
    ],
    triggerFishLair: [
      { ...king, text: say(
        'The Yellow Crystal Corgi! Past all those trigger fish? What a brave pup!',
        'Жёлтый Хрустальный Корги! Мимо всех этих рыб-спинорогов? Какой храбрый щенок!',
        'Gula Kristallcorgin! Förbi alla de där tryckarfiskarna? Vilken modig valp!',
        'Yelvra Korli! Drel trigershol? Vorli korli!',
      ) },
    ],
    friedEgg: [
      { ...king, text: say(
        `The White Crystal Corgi! I hope that egg monster wasn't too much trouble.`,
        'Белый Хрустальный Корги! Надеюсь, яичный монстр не доставил хлопот.',
        'Vita Kristallcorgin! Jag hoppas att äggmonstret inte var för besvärligt.',
        'Velra Korli! Eshrova Morgul nel losh?',
      ) },
    ],
    depths: [
      { ...king, text: say(
        'The Black Crystal Corgi! All the way to the bottom and back on one breath!',
        'Чёрный Хрустальный Корги! До самого дна и обратно на одном вдохе!',
        'Svarta Kristallcorgin! Ända ner till botten och tillbaka på ett andetag!',
        'Nerva Korli! Drekal tal drekalun vä renvor, fes shalvin!',
      ) },
    ],
    hell: [
      { ...king, text: say(
        `The Fire Crystal Corgi! It's still warm!`,
        'Огненный Хрустальный Корги! Он ещё тёплый!',
        'Eldkristallcorgin! Den är fortfarande varm!',
        'Fyrra Korli! Tal vashel!',
      ) },
    ],
  } satisfies Record<RealmName, DialogMessage[]>,
  remaining: (left: number): DialogMessage[] => [
    { ...king, text: left === 1
      ? say(
        'Only one Crystal Corgi left to find!',
        'Остался всего один Хрустальный Корги!',
        'Bara en Kristallcorgi kvar att hitta!',
        'Fes Kristal Korli neren naril!',
      )
      : say(
        `Only ${left} Crystal Corgis left to find!`,
        `Осталось найти всего ${left} Хрустальных Корги!`,
        `Bara ${left} Kristallcorgisar kvar att hitta!`,
        `${left} Kristal Korli neren naril!`,
      ) },
    { ...link, text: woof },
  ],
  ending: [
    { ...king, text: say(
      'All five Crystal Corgis, home at last!',
      'Все пять Хрустальных Корги наконец дома!',
      'Alla fem Kristallcorgisar, hemma till slut!',
      'Talvori 5 Kristal Korli, renvor tal!',
    ) },
    { ...king, text: say(
      'Linkosha, you have done what no corgi has done before.',
      'Линкоша, ты сделал то, чего не делал ни один корги.',
      'Linkosha, du har gjort det ingen corgi har gjort förut.',
      'Linkosha, shon drevok nel korli drevok.',
    ) },
    { ...link, text: woofQuestion },
    { ...king, text: say(
      'I have ruled this kingdom for a very long time, and I am getting rather sleepy.',
      'Я правлю этим королевством очень давно и уже порядком устал.',
      'Jag har styrt det här riket väldigt länge, och jag börjar bli ganska sömnig.',
      'Mel kalun tal Kalunra talvori talun, vä mel lerosh-nera.',
    ) },
    { ...king, text: say(
      'The kingdom needs a brave new ruler. I can think of no one better.',
      'Королевству нужен новый храбрый правитель. Лучше тебя не найти.',
      'Riket behöver en ny modig härskare. Jag kan inte tänka mig någon bättre.',
      'Kalunra varil vorli kalun veshra. Nel savor shon.',
    ) },
    { ...king, text: say(
      'Linkosha, I give you my crown!',
      'Линкоша, я отдаю тебе свою корону!',
      'Linkosha, jag ger dig min krona!',
      'Linkosha, mel dralon shon kalun-krona!',
    ) },
    { ...link, text: say('WOOF WOOF!', 'ГАВ-ГАВ!', 'VOFF VOFF!', 'WUF WUF!') },
  ],
} as const

// What the corgis about the kingdom say as Linkosha swims by, before and after taking the crown
export const CorgiCitizenBackgroundDialogLines = {
  visitor: [
    say('Woof! A visitor!', 'Гав! У нас гость!', 'Voff! En besökare!', 'Wuf! Shonari!'),
    say('Welcome to the Corgi Kingdom!', 'Добро пожаловать в Королевство Корги!', 'Välkommen till Corgiriket!', 'Hela tal Korli Kalunra!'),
    say('Have you met the King? He has a quest for brave pups.', 'Ты уже видел Короля? У него есть задание для храбрых щенков.', 'Har du träffat kungen? Han har ett uppdrag för modiga valpar.', 'Shon varil Kalun? Drevok for vorli korli.'),
    say('They say the Crystal Corgis are hidden in five strange realms.', 'Говорят, Хрустальные Корги спрятаны в пяти странных мирах.', 'Det sägs att Kristallcorgisarna är gömda i fem konstiga riken.', 'Kristal Korli tal 5 rielm nerval.'),
    say('Nice snorkel!', 'Классная трубка!', 'Snygg snorkel!', 'Lerosh snorkul!'),
    say('The King has looked so worried lately.', 'Король в последнее время такой встревоженный.', 'Kungen har sett så orolig ut på sistone.', 'Kalun varil losh talun.'),
    say('Is that a human with you? How exciting!', 'С тобой человек? Как интересно!', 'Är det en människa med dig? Vad spännande!', 'Terra-shonari vä shon? Lerosh!'),
    say(`We don't get many visitors from up above.`, 'Сверху к нам редко заглядывают гости.', 'Vi får inte många besökare uppifrån.', 'Terra shonari nel talvori.'),
    say('I heard one Crystal Corgi ended up in outer space!', 'Говорят, один Хрустальный Корги попал в открытый космос!', 'Jag hörde att en Kristallcorgi hamnade i rymden!', 'Fes Kristal Korli tal estrel!'),
    say(`Paddle, paddle, paddle. That's how we get about down here.`, 'Гребём, гребём, гребём. Так мы тут и плаваем.', 'Paddla, paddla, paddla. Så tar vi oss fram här nere.', 'Shavor, shavor, shavor. Korli tal drekal!'),
    say('Fancy a nap? The water down here is lovely and warm.', 'Не хочешь вздремнуть? Вода здесь такая тёплая.', 'Sugen på en tupplur? Vattnet här nere är skönt och varmt.', 'Shon nera? Vashra tal lerosh vä vashel.'),
    say(`Please help the King. He hasn't wagged his tail in weeks.`, 'Пожалуйста, помоги Королю. Он уже несколько недель не виляет хвостом.', 'Snälla, hjälp kungen. Han har inte viftat på svansen på flera veckor.', 'Naril Kalun, korli. Kalun nel wagra talun.'),
  ],
  king: [
    say('Long live King Linkosha!', 'Да здравствует король Линкоша!', 'Länge leve kung Linkosha!', 'Lorva Kalun Linkosha!'),
    say('Your Majesty!', 'Ваше Величество!', 'Ers Majestät!', 'Kalun-vor!'),
    say('All hail King Linkosha!', 'Слава королю Линкоше!', 'Hell kung Linkosha!', 'Lorva, lorva Kalun Linkosha!'),
    say('The crown suits you, Your Majesty!', 'Корона вам к лицу, Ваше Величество!', 'Kronan klär er, Ers Majestät!', 'Kalun-krona savor tal shon, Kalun-vor!'),
    say('Thank you for bringing the Crystal Corgis home!', 'Спасибо, что вернули Хрустальных Корги домой!', 'Tack för att du tog hem Kristallcorgisarna!', 'Telvor for naril Kristal Korli renvor!'),
    say(`Best king ever. Don't tell the old one.`, 'Лучший король на свете. Только старому не говорите.', 'Bästa kungen någonsin. Säg inget till den gamla.', 'Savor kalun talvori. Nel dralon ta Kalun-neren.'),
    say('Three cheers for King Linkosha!', 'Троекратное ура королю Линкоше!', 'Ett fyrfaldigt leve för kung Linkosha!', 'Lorva, lorva, lorva Kalun Linkosha!'),
    say('A king who swims with humans! How modern!', 'Король, который плавает с людьми! Как современно!', 'En kung som simmar med människor! Så modernt!', 'Kalun shavor vä terra-shonari! Lerosh!'),
    say('Is it true you swam through a realm of fire?', 'Правда, что вы проплыли через огненный мир?', 'Är det sant att ni simmade genom ett rike av eld?', 'Shon shavor tal fyrra rielm?'),
    say('Will there be a royal feast, Your Majesty?', 'Будет ли королевский пир, Ваше Величество?', 'Blir det en kunglig fest, Ers Majestät?', 'Kalun-festra, Kalun-vor?'),
    say('I bowed so low I bumped my nose on the floor!', 'Я так низко поклонился, что ударился носом об пол!', 'Jag bugade så djupt att jag slog näsan i golvet!', 'Mel drekal losh, mel nosra au!'),
    say('The whole kingdom is wagging its tail for you!', 'Всё королевство виляет хвостом в вашу честь!', 'Hela riket viftar på svansen för er!', 'Kalunra wagra for shon!'),
  ],
} as const satisfies Record<string, readonly Localised[]>

export const OldKingBackgroundDialogLines = [
  say('Long live King Linkosha!', 'Да здравствует король Линкоша!', 'Länge leve kung Linkosha!', 'Lorva Kalun Linkosha!'),
  say('My head feels so light without that crown.', 'Без короны голове так легко.', 'Huvudet känns så lätt utan den där kronan.', 'Mel hedra losh nel kalun-krona.'),
  say('Retirement suits me. Paddle, nap, paddle.', 'Пенсия мне к лицу. Поплаваю, вздремну, поплаваю.', 'Pensionen passar mig. Paddla, sova, paddla.', 'Neralin lerosh. Shavor, nera, shavor.'),
  say('The crown looks much better on you.', 'Корона тебе идёт гораздо больше.', 'Kronan passar dig mycket bättre.', 'Kalun-krona savor tal shon.'),
] as const

// Each realm's guide explains the realm when you arrive and congratulates you at the end
export const RealmDialogs = {
  corgosphere: {
    intro: [
      { ...cosmo, text: say(
        'Greetings, earth pup! Welcome to the Corgosphere!',
        'Приветствую, земной щенок! Добро пожаловать в Коргосферу!',
        'Hälsningar, jordvalp! Välkommen till Corgosfären!',
        'Hela, terra-korli! Hela tal Korgosfera!',
      ) },
      { ...link, text: woofQuestion },
      { ...cosmo, text: say(
        'Space has no water and no air, but these big air bubbles will keep you breathing.',
        'В космосе нет ни воды, ни воздуха, но эти большие воздушные пузыри помогут тебе дышать.',
        'I rymden finns inget vatten och ingen luft, men de här stora luftbubblorna låter dig andas.',
        'Estrel nel vashra nel oxira, vä bolra oxira shalvin shon.',
      ) },
      { ...cosmo, text: say(
        'Your oxygen runs out fast outside them, so hop from bubble to bubble.',
        'Снаружи кислород быстро заканчивается, так что прыгай от пузыря к пузырю.',
        'Utanför dem tar syret snabbt slut, så hoppa från bubbla till bubbla.',
        'Drel bolra oxira losh, shavor bolra ta bolra.',
      ) },
      { ...cosmo, text: say(
        'Watch out for asteroids, space urchins and space jellyfish. They knock the air right out of you!',
        'Берегись астероидов, космических ежей и космических медуз. Они вышибают из тебя весь воздух!',
        'Se upp för asteroider, rymdsjöborrar och rymdmaneter. De slår luften ur dig!',
        'Vayren astrol, estrel-urchel vä estrel-medul. Oxira melun!',
      ) },
      { ...cosmo, text: say(
        'The Ruby Crystal Corgi is at the far end of the bubbles. Good luck!',
        'Рубиновый Хрустальный Корги ждёт в самом конце пузырей. Удачи!',
        'Rubinkristallcorgin finns längst bort bland bubblorna. Lycka till!',
        'Rubin Korli tal voryn bolra. Lerosh!',
      ) },
    ],
    end: [
      { ...cosmo, text: say(
        'You made it! That was out of this world!',
        'У тебя получилось! Это было просто космос!',
        'Du klarade det! Det var helt utomjordiskt!',
        'Shon drevok! Estrel-lerosh!',
      ) },
      { ...cosmo, text: say(
        'Take the Ruby Crystal Corgi home through the portal.',
        'Неси Рубинового Хрустального Корги домой через портал.',
        'Ta hem Rubinkristallcorgin genom portalen.',
        'Naril Rubin Korli renvor drel portalun.',
      ) },
    ],
  },
  triggerFishLair: {
    intro: [
      { ...chum, text: say(
        'Ahoy, pup! Welcome to the Lair of Trigger Fish.',
        'Ахой, щенок! Добро пожаловать в Логово рыб-спинорогов.',
        'Ohoj, valp! Välkommen till Tryckarfiskarnas Lya.',
        'Ahoy, korli! Hela tal Lavren Trigershol.',
      ) },
      { ...chum, text: say(
        'These waters are full of trigger fish, and they bite!',
        'Эти воды кишат рыбами-спинорогами, и они кусаются!',
        'Det här vattnet är fullt av tryckarfiskar, och de bits!',
        'Vashra talvori trigershol, vä kelvor!',
      ) },
      { ...link, text: say('Woof...', 'Гав...', 'Voff...', 'Wuf...') },
      { ...chum, text: say(
        'But trigger fish can never resist a tasty bit of bait. Here, take ten.',
        'Но спинороги никогда не устоят перед вкусной наживкой. Держи, вот десять.',
        'Men tryckarfiskar kan aldrig motstå lite gott bete. Här, ta tio.',
        'Trigershol nel nelvor kelvra. Tal, naril dekal.',
      ) },
      { ...chum, text: say(
        'Press E to drop some bait. Any trigger fish nearby will go for it instead of you.',
        'Нажми E, чтобы бросить наживку. Спинороги поблизости набросятся на неё, а не на тебя.',
        'Tryck på E för att släppa bete. Tryckarfiskar i närheten går på det i stället för dig.',
        'Pryn E for kelvra. Trigershol shavor ta kelvra, nel shon.',
      ) },
      { ...chum, text: say(
        `Use it wisely, there's no more where that came from!`,
        'Расходуй с умом, больше взять негде!',
        'Använd det klokt, det finns inget mer!',
        'Savor kelvra, nel neren!',
      ) },
      { ...chum, text: say(
        'The water goes deep, so equalise often. Swim to the top whenever you need air.',
        'Здесь глубоко, так что почаще выравнивай давление. Плыви наверх, когда нужен воздух.',
        'Vattnet är djupt, så tryckutjämna ofta. Simma upp till ytan när du behöver luft.',
        'Vashra drekalun, venqorin talvori. Shavor larven for oxira.',
      ) },
    ],
    end: [
      { ...chum, text: say(
        'Blow me down, you made it through!',
        'Разрази меня гром, ты прорвался!',
        'Det var som tusan, du tog dig igenom!',
        'Vorin-tal, shon drevok drel!',
      ) },
      { ...chum, text: say(
        'The Yellow Crystal Corgi is yours. The portal will take you home.',
        'Жёлтый Хрустальный Корги твой. Портал отнесёт тебя домой.',
        'Gula Kristallcorgin är din. Portalen tar dig hem.',
        'Yelvra Korli shon. Portalun renvor shon.',
      ) },
    ],
  },
  friedEgg: {
    intro: [
      { ...yolko, text: say(
        'Well, egg-scuse me! A visitor to the Fried Egg Dimension!',
        'Ой, яйц-звините! Гость в Измерении Яичницы!',
        'Nämen, ägg-sekusera mig! En besökare i Stekta Äggets Dimension!',
        'Esh-velor! Shonari tal Eshsholin Dimenra!',
      ) },
      { ...yolko, text: say(
        `The Scrambled Egg Monster is throwing a party, and he's in a terrible scramble.`,
        'Монстр-Омлет устраивает вечеринку, и у него всё вверх тормашками.',
        'Äggröremonstret har fest, och han är helt uppvispad.',
        'Eshrova Morgul silen festra, vä tal eshrova-losh.',
      ) },
      { ...yolko, text: say(
        'He needs 100 fried eggs and he needs them in 60 seconds. Can you help?',
        'Ему нужно 100 яичниц, и нужно за 60 секунд. Поможешь?',
        'Han behöver 100 stekta ägg, och han behöver dem på 60 sekunder. Kan du hjälpa till?',
        'Varil 100 eshshol tal 60 talun. Shon telvä?',
      ) },
      { ...link, text: woof },
      { ...yolko, text: say(
        'Egg-cellent! Swim into the fried eggs to collect them. Ready... set... go!',
        'Яйц-ллентно! Подплывай к яичницам, чтобы собрать их. На старт... внимание... марш!',
        'Ägg-cellent! Simma in i de stekta äggen för att samla dem. Klara... färdiga... gå!',
        'Esh-lerosh! Shavor ta eshshol for naril. Tal... tal... kalyra!',
      ) },
    ],
    end: [
      { ...yolko, text: say(
        'You really came out of your shell today!',
        'Сегодня ты точно вылупился из скорлупы!',
        'Du kläckte verkligen till idag!',
        'Shon drel eshkel talun!',
      ) },
      { ...yolko, text: say(
        'Take the White Crystal Corgi home. The portal is all yours.',
        'Неси Белого Хрустального Корги домой. Портал в твоём распоряжении.',
        'Ta hem Vita Kristallcorgin. Portalen är din.',
        'Naril Velra Korli renvor. Portalun shon.',
      ) },
    ],
  },
  depths: {
    intro: [
      { ...fathom, text: say(
        'Welcome, athlete, to the Depths.',
        'Добро пожаловать в Глубины, спортсмен.',
        'Välkommen till Djupet, idrottare.',
        'Hela tal Drekalun, drekari.',
      ) },
      { ...fathom, text: say(
        'This is a constant weight dive. Follow the rope all the way to the bottom.',
        'Это погружение в постоянном весе. Следуй по тросу до самого дна.',
        'Det här är ett dyk i konstant vikt. Följ linan hela vägen ner till botten.',
        'Talvori-drek drekal. Shavor drel ropul ta drekalun.',
      ) },
      { ...fathom, text: say(
        'The Black Crystal Corgi waits at the end of the rope.',
        'Чёрный Хрустальный Корги ждёт в конце троса.',
        'Svarta Kristallcorgin väntar vid slutet av linan.',
        'Nerva Korli tal voryn ropul.',
      ) },
      { ...fathom, text: say(
        `Down there your oxygen goes faster the deeper you are, so equalise well and don't dawdle.`,
        'Чем глубже, тем быстрее уходит кислород, так что хорошо выравнивай давление и не мешкай.',
        'Ju djupare du är, desto snabbare går syret åt, så tryckutjämna väl och dröj inte.',
        'Drekalun oxira losh-losh, venqorin savor vä nel nerval.',
      ) },
      { ...fathom, text: say(
        'Bring it back to the surface on one breath. Official top in your own time.',
        'Подними его на поверхность на одном вдохе. Официальный старт в любое время.',
        'Ta upp den till ytan på ett andetag. Officiell start när du vill.',
        'Naril ta larven fes shalvin. Kalyra tal shon talun.',
      ) },
    ],
    end: [
      { ...fathom, text: say(
        'Surface protocol complete. White card!',
        'Протокол выхода выполнен. Белая карточка!',
        'Ytprotokoll klart. Vitt kort!',
        'Larven-drevok tal. Velra kardel!',
      ) },
      { ...fathom, text: say(
        'A clean dive. The Black Crystal Corgi is yours, and the portal is open.',
        'Чистое погружение. Чёрный Хрустальный Корги твой, а портал открыт.',
        'Ett rent dyk. Svarta Kristallcorgin är din, och portalen är öppen.',
        'Savor drekal. Nerva Korli shon, vä portalun tal.',
      ) },
    ],
  },
  hell: {
    intro: [
      { ...ember, text: say(
        `Welcome to Hell. Mind the steam, it's a bit hot down here.`,
        'Добро пожаловать в Ад. Осторожно с паром, тут жарковато.',
        'Välkommen till Helvetet. Akta ångan, det är lite varmt här nere.',
        'Hela tal Vashkur. Vayren vashel, tal vashel-losh.',
      ) },
      { ...ember, text: say(
        'The Fire Crystal Corgi belongs to the Demon Corgi Fish, and it never gives anything away.',
        'Огненный Хрустальный Корги принадлежит Демону корги-рыбе, а он никогда ничего не отдаёт.',
        'Eldkristallcorgin tillhör Demoncorgifisken, och den ger aldrig bort något.',
        'Fyrra Korli tal Vashkur Korlishol, vä nel dralon.',
      ) },
      { ...ember, text: say(
        `Well, almost never. It can't resist a race.`,
        'Ну, почти никогда. Перед гонкой он устоять не может.',
        'Nja, nästan aldrig. Den kan inte motstå en kapplöpning.',
        'Nel-nel. Revorin nel nelvor.',
      ) },
      { ...ember, text: say(
        'Beat it to the end and see what happens. Grab air bubbles to keep breathing.',
        'Обгони его до финиша и посмотри, что будет. Хватай воздушные пузыри, чтобы дышать.',
        'Slå den till mål och se vad som händer. Ta luftbubblor för att kunna andas.',
        'Revorin ta voryn vä varil. Naril bolra oxira for shalvin.',
      ) },
      { ...demon, text: say(
        'A race? Against YOU? Hah! Try to keep up, puppy!',
        'Гонка? С ТОБОЙ? Ха! Попробуй не отстать, щенок!',
        'En kapplöpning? Mot DIG? Ha! Försök hänga med, valpen!',
        'Revorin? Vä SHON? Ha! Shavor drel, korli!',
      ) },
    ],
    end: [
      { ...ember, text: say(
        `I've never seen anyone make friends with a devil before!`,
        'Никогда не видел, чтобы кто-то подружился с дьяволом!',
        'Jag har aldrig sett någon bli vän med en djävul förut!',
        'Mel nel varil shonari vä vashkalun!',
      ) },
      { ...ember, text: say(
        'Take the Fire Crystal Corgi home. The portal is open.',
        'Неси Огненного Хрустального Корги домой. Портал открыт.',
        'Ta hem Eldkristallcorgin. Portalen är öppen.',
        'Naril Fyrra Korli renvor. Portalun tal.',
      ) },
    ],
  },
} as const satisfies Record<RealmName, { intro: DialogMessage[], end: DialogMessage[] }>

export const EggMonsterDialog = {
  bring: [
    { ...eggMonsterHappy, text: say(
      `You've got them all! Bring them to me!`,
      'Все яйца собраны! Неси их мне!',
      'Du har samlat alla! Kom hit med dem till mig!',
      'Esh tal! Naril esh ta mel!',
    ) },
  ],
  full: [
    { ...eggMonsterHappy, text: say(
      'One hundred eggs! Oh, these are egg-squisite...',
      'Сто яиц! О, они яйц-исканные...',
      'Hundra ägg! Åh, de är ägg-kvisita...',
      'Hundar esh! Ooh, esh-savor...',
    ) },
  ],
  gulp: [
    { ...eggMonsterHappy, text: say('Gulp. Gulp. GULP.', 'Ням. Ням. НЯМ.', 'Glupp. Glupp. GLUPP.', 'Gulp. Gulp. GULP.') },
  ],
  // From here on he's shown his true, angry face
  reveal: [
    { ...eggMonster, text: say(
      'HA! It was a yolk all along! There is no party!',
      'ХА! Это был желтковый розыгрыш! Никакой вечеринки нет!',
      'HA! Det var bara ett gul-skämt! Det blir ingen fest!',
      'HA! Yolk-lerosh! Nel festra!',
    ) },
    { ...eggMonster, text: say(
      `Now I'm going to turn YOU into an egg! Prepare to be poached!`,
      'А теперь я превращу ТЕБЯ в яйцо! Готовься стать яйцом-пашот!',
      'Nu ska jag förvandla DIG till ett ägg! Gör dig redo att bli förlorad!',
      'Ta mel eshvor SHON! Tal eshrova!',
    ) },
    { ...yolko, text: say(
      `Oh no, he's gone completely scrambled! Dodge his eggs and survive for 60 seconds until he runs out!`,
      'Ой-ой, он совсем взболтался! Уворачивайся от его яиц и продержись 60 секунд, пока они у него не кончатся!',
      'Åh nej, han har blivit helt uppvispad! Undvik hans ägg och överlev i 60 sekunder tills de tar slut!',
      'Oh nel, tal eshrova-losh! Shavor drel esh vä shalvor 60 talun!',
    ) },
  ],
  sorry: [
    { ...eggMonsterHappy, text: say(
      `Phew... I'm all out of eggs. I'm eggs-hausted.`,
      'Фух... яйца кончились. Я совсем выяйцался.',
      'Puh... jag har slut på ägg. Jag är helt ägg-sist.',
      'Puh... nel esh. Mel esh-melun.',
    ) },
    { ...eggMonsterHappy, text: say(
      `I'm sorry. That was a really bad yolk. I think I just got a bit too egg-cited.`,
      'Прости. Это был очень плохой желтковый розыгрыш. Кажется, я слишком разъяйцился.',
      'Förlåt. Det var ett riktigt dåligt gul-skämt. Jag blev nog lite för ägg-saltad.',
      'Velor. Losh yolk-lerosh. Mel esh-vorin losh.',
    ) },
    { ...eggMonsterHappy, text: say(
      'Here, have this crystal corgi. No hard-boiled feelings?',
      'Вот, держи этого хрустального корги. Без крутых обид?',
      'Här, ta den här kristallcorgin. Inga hårdkokta känslor?',
      'Tal, naril kristal korli. Nel esh-vashel?',
    ) },
    { ...link, text: woof },
  ],
} as const satisfies Record<string, DialogMessage[]>

export const DemonDialog = {
  // Background Dialog while it waits for you during the race
  mocking: [
    say('Too slow!', 'Слишком медленно!', 'För långsamt!', 'Losh-shavor!'),
    say(`Is that all you've got?`, 'И это всё, на что ты способен?', 'Är det allt du har?', 'Shon tal talvori?'),
    say('I could race you backwards!', 'Я могу обогнать тебя задом наперёд!', 'Jag kan slå dig baklänges!', 'Mel revorin delun!'),
    say('Yawn...', 'Зевота...', 'Gäsp...', 'Hauuu...'),
    say('Are you even trying, puppy?', 'Ты вообще стараешься, щенок?', 'Försöker du ens, valpen?', 'Shon shavor, korli?'),
    say('Catch me if you can!', 'Поймай, если сможешь!', 'Ta mig om du kan!', 'Naril mel, korli!'),
  ],
  lost: [
    { ...demon, text: say('WHAT?! Nobody beats me!', 'ЧТО?! Меня никто не обгоняет!', 'VAD?! Ingen slår mig!', 'VARIL?! Nel revorin mel!') },
    { ...devil, text: say(
      'Behold my TRUE form! The Devil Corgi Fish!',
      'Узри мой ИСТИННЫЙ облик! Дьявольская корги-рыба!',
      'Se min SANNA form! Djävulscorgifisken!',
      'Varil mel TALVORI! Vashkalun Korlishol!',
    ) },
    { ...devil, text: say(
      `You'll never get the Fire Crystal Corgi now!`,
      'Теперь тебе ни за что не получить Огненного Хрустального Корги!',
      'Nu får du aldrig Eldkristallcorgin!',
      'Shon nel naril Fyrra Korli!',
    ) },
  ],
  won: [
    { ...demon, text: say(
      'Hah! Too slow, puppy! Off you go!',
      'Ха! Слишком медленно, щенок! Проваливай!',
      'Ha! För långsamt, valpen! Iväg med dig!',
      'Ha! Losh-shavor, korli! Renvor!',
    ) },
  ],
  defeated: [
    { ...devilFriend, text: say('Ow! Okay, okay, I give up!', 'Ай! Ладно, ладно, сдаюсь!', 'Aj! Okej, okej, jag ger upp!', 'Au! Tal, tal, mel neren!') },
    { ...devilFriend, text: say(
      'You know... nobody has ever kept up with me before.',
      'Знаешь... раньше за мной никто не успевал.',
      'Vet du... ingen har någonsin hängt med mig förut.',
      'Varil... nel shavor drel mel.',
    ) },
    { ...devilFriend, text: say(
      `I'm sorry I was so mean. Maybe we could be friends instead?`,
      'Прости, что был таким злым. Может, лучше будем друзьями?',
      'Förlåt att jag var så elak. Vi kanske kan vara vänner i stället?',
      'Velor, mel losh. Shon vä mel shonari?',
    ) },
    { ...link, text: woof },
    { ...devilFriend, text: say(
      `Here, a friend should have this. It's the Fire Crystal Corgi!`,
      'Вот, это должно быть у друга. Это Огненный Хрустальный Корги!',
      'Här, en vän borde få den här. Det är Eldkristallcorgin!',
      'Tal, shonari naril. Fyrra Korli!',
    ) },
  ],
} as const

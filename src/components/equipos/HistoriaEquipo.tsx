
import type { Equipo } from '../../pages/Equipos'
import './HistoriaEquipo.css'

interface HistoriaClub {
  titulo: string
  descripcion: string
}

interface HistoriaEquipoProps {
  equipo: Equipo
}

// Aquí se guarda la historia de cada club.
// Escribe el título y la descripción dentro de cada equipo.
// Deja los campos como '' si todavía no has preparado su historia.

const historias: Record<string, HistoriaClub> = {
  // 1. ATHLETIC CLUB
  'athletic club': {
    titulo: 'De nuestra tierra. De nuestra gente. De nuestro Athletic.',
    descripcion: `La historia del Athletic Club comienza a finales del siglo XIX, cuando el fútbol llegó a Bizkaia gracias a la influencia británica y a los jóvenes vascos que conocieron este deporte en Inglaterra. En 1898 se fundó el club, que pronto se convertiría en uno de los grandes protagonistas del fútbol español.

En sus primeros años llegaron los primeros éxitos. En 1903 conquistó su primera Copa y, en 1910, adoptó los característicos colores rojiblancos que hoy representan al equipo. En 1913 inauguró el histórico estadio de San Mamés, conocido como La Catedral, que se convirtió en el corazón de la afición athleticzale.

Durante las décadas de 1920 y 1930, el Athletic destacó por sus títulos y por jugadores legendarios como Pichichi. Más adelante, futbolistas como Telmo Zarra y Agustín Gainza continuaron engrandeciendo la historia del club, convirtiéndolo en una referencia del fútbol nacional.

Una de las características más especiales del Athletic es su apuesta por los jugadores formados en casa y su vínculo con el fútbol vasco. La apertura de Lezama en 1971 reforzó el trabajo de cantera y consolidó una filosofía que ha marcado la identidad rojiblanca durante generaciones.

En la década de 1980, el equipo vivió otra de sus grandes etapas, conquistando las Ligas de 1982-83 y 1983-84, además de la Copa de 1984. Aquellos triunfos dejaron imágenes inolvidables, especialmente las celebraciones por la ría de Bilbao a bordo de la Gabarra.

Con el paso de los años, el club ha afrontado nuevos retos sin renunciar a su identidad. En 2013 inauguró el nuevo San Mamés y continuó compitiendo al máximo nivel, mientras su equipo femenino también se consolidaba como una parte importante de la entidad.

En 2024, el Athletic volvió a conquistar la Copa del Rey tras vencer al Mallorca en la tanda de penaltis. La victoria puso fin a cuatro décadas de espera y permitió que la Gabarra volviera a recorrer la ría de Bilbao, en una celebración que reunió a miles de aficionados.

Hoy, el Athletic Club representa mucho más que un equipo de fútbol. Su historia está construida sobre la tradición, la cantera, sus colores y el sentimiento de una afición que transmite su pasión de generación en generación. Una historia que nació en Bilbao y que continúa escribiéndose en cada partido.`,
  },

// 2. ATLÉTICO DE MADRID
'atletico de madrid': {
  titulo: 'Coraje y corazón',
  descripcion: `El Atlético de Madrid nació el 26 de abril de 1903, cuando un grupo de estudiantes vascos residentes en Madrid fundó el Athletic Club de Madrid. En sus primeros años, el equipo fue creciendo hasta convertirse en una parte importante del fútbol madrileño.

En 1911 llegaron las camisetas rojiblancas que dieron origen al apodo de colchoneros, debido a su parecido con las fundas de los colchones de la época. Años después, en 1923, el club inauguró el Stadium Metropolitano, uno de sus primeros grandes estadios.

Tras la Guerra Civil, el equipo vivió una etapa de crecimiento y conquistó las Ligas de 1939-40 y 1940-41. En 1947 adoptó el nombre de Club Atlético de Madrid, consolidando la identidad con la que sería conocido en las siguientes décadas.

Durante los años sesenta y setenta, el Atlético conquistó varios títulos nacionales y se convirtió en uno de los equipos más importantes de España. En 1966 se trasladó al estadio del Manzanares, posteriormente conocido como Vicente Calderón. En 1974 alcanzó la final de la Copa de Europa y, ese mismo año, conquistó la Copa Intercontinental.

La temporada 1995-96 quedó grabada en la memoria de los aficionados. Bajo la dirección de Radomir Antic, el Atlético ganó la Liga y la Copa del Rey, consiguiendo el histórico Doblete. Sin embargo, el cambio de siglo trajo dificultades y, en el año 2000, el equipo descendió a Segunda División. En 2002 regresó a Primera, iniciando una nueva etapa de recuperación.

A partir de 2011, con Diego Pablo Simeone como entrenador, el club vivió uno de los periodos más exitosos de su historia reciente. Ganó la Europa League en 2012, la Copa del Rey en 2013 y la Liga en la temporada 2013-14, además de alcanzar dos finales de la Champions League en 2014 y 2016.

En 2017, el Atlético dejó el Vicente Calderón y se trasladó al nuevo estadio, inicialmente llamado Wanda Metropolitano y actualmente conocido como Riyadh Air Metropolitano. En la temporada 2017-18 volvió a conquistar la Europa League y, en 2018, la Supercopa de Europa. En 2021, el equipo consiguió una nueva Liga, reafirmando su capacidad para competir al máximo nivel.

A lo largo de su historia, el Atlético también ha impulsado el crecimiento de su equipo femenino, que ha logrado importantes éxitos en las competiciones nacionales.

Hoy, el Atlético de Madrid es mucho más que sus títulos. Su historia está marcada por el esfuerzo, la perseverancia y el sentimiento de una afición que acompaña al equipo en los buenos y en los malos momentos. Desde sus primeros años hasta la actualidad, el orgullo rojiblanco continúa pasando de generación en generación.`
},


// 3. CA OSASUNA
'osasuna': {
  titulo: 'El orgullo de todo un pueblo',
  descripcion: `El nacimiento de una pasión (1920-1930)

El Club Atlético Osasuna nació el 24 de octubre de 1920 en el Café Kutz, situado en la Plaza del Castillo de Pamplona. Su fundación surgió de la unión de diferentes grupos vinculados al fútbol local, con la intención de crear un club que representara a la ciudad. El nombre elegido fue Osasuna, una palabra en euskera que significa salud o vigor, y el rojo se convirtió desde el principio en uno de sus principales símbolos.

Durante sus primeros años, el equipo despertó un interés creciente entre los aficionados. En 1922 comenzó la construcción del campo de San Juan, inaugurado en 1923, que permitió al club crecer y reunir a una afición cada vez más numerosa.

El sueño de llegar a Primera (1930-1940)

Durante los años treinta, Osasuna continuó creciendo deportivamente y consiguió regresar a Segunda División en 1932. Con jugadores destacados como Julián Vergara, el equipo fue ganando protagonismo hasta alcanzar por primera vez la Primera División en la temporada 1935-36.

Sin embargo, la Guerra Civil interrumpió aquella progresión y afectó profundamente al club. Osasuna tuvo que afrontar años complicados, en los que mantener su actividad deportiva se convirtió en un reto.

Los años difíciles de la posguerra (1940-1950)

La década de los cuarenta fue una de las etapas más duras de la historia rojilla. Los problemas económicos y la falta de estabilidad llevaron al equipo a descender hasta Tercera División, donde permaneció durante varias temporadas.

A pesar de las dificultades, el club siguió trabajando para recuperar su lugar en el fútbol nacional. En la temporada 1948-49 consiguió regresar a Segunda División, un paso fundamental para volver a aspirar a la máxima categoría.

El regreso a la élite (1950-1960)

En 1953, Osasuna logró el ascenso a Primera División, dieciocho años después de su primera participación en la categoría. El éxito desató una enorme alegría en Pamplona y confirmó que el club podía volver a competir entre los mejores.

Durante los años siguientes, el equipo alternó buenos resultados con nuevas dificultades deportivas, pero mantuvo el apoyo de una afición que continuó acompañándolo en cada etapa.

El nacimiento de El Sadar (1960-1970)

Los años sesenta comenzaron con un nuevo ascenso a Primera División en 1961, después de proclamarse campeón de Segunda. Aquella generación de futbolistas devolvió la ilusión a los seguidores rojillos.

En 1967, Osasuna inauguró el estadio de El Sadar, que sustituyó al campo de San Juan. El nuevo recinto se convirtió en el hogar del osasunismo y en uno de los grandes símbolos de la identidad del club.

Una etapa de reconstrucción (1970-1980)

La década de los setenta estuvo marcada por las dificultades económicas y deportivas. Osasuna pasó varias temporadas entre Segunda y Tercera División, mientras intentaba recuperar la estabilidad institucional.

En 1971, Fermín Ezcurra llegó a la presidencia e inició una etapa de transformación que resultaría decisiva para el futuro de la entidad. Su gestión sentó las bases para fortalecer el club y preparar el camino hacia una época de mayor crecimiento.

De nuevo entre los grandes (1980-1990)

El ascenso de 1980 marcó el inicio de una de las mejores etapas de Osasuna. El equipo consiguió mantenerse durante catorce temporadas consecutivas en Primera División y empezó a competir por objetivos cada vez más ambiciosos.

En la temporada 1985-86 logró clasificarse para una competición europea por primera vez, después de terminar la Liga en sexta posición. El 18 de septiembre de 1985 disputó su primer encuentro europeo ante el Rangers escocés.

Además, en 1982 se inauguraron las instalaciones de Tajonar, fundamentales para el desarrollo de los equipos de formación y para el crecimiento de la cantera rojilla.

Las noches que hicieron historia (1990-2000)

El comienzo de los años noventa dejó algunos de los momentos más recordados por la afición. El 30 de diciembre de 1990, Osasuna venció al Real Madrid por 0-4 en el Santiago Bernabéu, con una actuación memorable de Jan Urban.

En la temporada 1990-91, el equipo terminó cuarto en Liga, igualando la mejor clasificación de su historia. Sin embargo, en 1994 llegó un nuevo descenso a Segunda División, que dio comienzo a una etapa complicada.

Tras varios años de dificultades, Osasuna consiguió regresar a Primera en el año 2000, gracias a una remontada final que devolvió la ilusión a Pamplona y permitió al club comenzar el nuevo milenio en la máxima categoría.

La época de mayor éxito deportivo (2000-2010)

Durante la primera década del siglo XXI, Osasuna vivió una de las etapas más destacadas de su trayectoria. En la temporada 2004-05 alcanzó por primera vez la final de la Copa del Rey, aunque terminó perdiendo frente al Real Betis.

Un año después, el equipo firmó una campaña extraordinaria y terminó cuarto en Primera División, logrando clasificarse para la fase previa de la Liga de Campeones por primera vez en su historia.

En la temporada 2006-07, Osasuna llegó hasta las semifinales de la Copa de la UEFA, donde estuvo cerca de alcanzar la final. Aquellos años situaron al club navarro entre los equipos más competitivos del fútbol español y europeo.

Superar los obstáculos (2010-2020)

La siguiente década estuvo marcada por nuevos desafíos. Tras varios años en Primera, Osasuna descendió a Segunda División en 2014. El club tuvo que reconstruirse deportiva e institucionalmente para recuperar su lugar.

El ascenso de 2016 devolvió al equipo a la máxima categoría, aunque en 2017 volvió a descender. Lejos de rendirse, Osasuna se reorganizó y, bajo la dirección de Jagoba Arrasate, consiguió regresar a Primera en 2019 como campeón de Segunda División.

En 2020, el club celebró su centenario, cien años después de aquella asamblea fundacional en Pamplona. La efeméride llegó en un periodo marcado por la pandemia, pero también por la ilusión de seguir construyendo el futuro del equipo.

El orgullo rojillo continúa (2020-actualidad)

En los últimos años, Osasuna ha trabajado para consolidarse en Primera División y reforzar su identidad. La reforma integral de El Sadar, elegida por los socios en 2019, permitió modernizar el estadio sin perder su papel como punto de encuentro de la afición.

La temporada 2022-23 dejó otro capítulo inolvidable: Osasuna alcanzó por segunda vez en su historia la final de la Copa del Rey. Aunque cayó ante el Real Madrid, el recorrido del equipo despertó una enorme ilusión en Navarra y confirmó la capacidad del club para competir frente a rivales de gran nivel.

Una historia que pertenece a toda Navarra

Desde su fundación en 1920, Osasuna ha vivido ascensos, descensos, grandes victorias y momentos difíciles. Su trayectoria está marcada por la perseverancia, el trabajo colectivo y el vínculo entre el equipo y su gente.

El Sadar representa mucho más que un estadio: es el lugar donde generaciones de aficionados comparten una misma pasión. Porque la historia de Osasuna no se explica únicamente a través de sus resultados, sino también mediante el orgullo de una ciudad y de toda una tierra que sigue acompañando a sus colores.

Más de un siglo después de su nacimiento, Osasuna continúa escribiendo su historia con el mismo sentimiento que lo vio nacer: el orgullo de todo un pueblo.`
},

// 4. CELTA
celta: {
  titulo: 'O orgullo dunha terra',
  descripcion: `El Real Club Celta de Vigo nació el 23 de agosto de 1923 de la unión del Vigo Sporting y el Fortuna de Vigo. La creación del nuevo equipo, impulsada por Manuel de Castro 'Handicap' y Juan Baliño Ledo, tenía como objetivo reunir fuerzas para competir al máximo nivel. En sus primeros años, el club vestía de rojo y negro, antes de convertirse en uno de los grandes símbolos deportivos de Galicia.

En 1928 se inauguró el estadio de Balaídos con una contundente victoria por 7-0 frente al Real Unión de Irún. El Celta siguió creciendo y, al terminar la temporada 1935/36, consiguió su primer ascenso a Primera División. Sin embargo, la Guerra Civil interrumpió las competiciones y el equipo tuvo que esperar para estrenarse en la máxima categoría. En 1939, Nolete marcó el primer gol celeste en Primera División.

Durante las décadas siguientes, el club vivió momentos importantes, como la adquisición de Balaídos en 1945 y su primera final de Copa en 1948. Aunque no logró levantar el trofeo, aquella etapa contribuyó a consolidar la identidad de un equipo cada vez más unido a su ciudad y a su afición.

En 1971, el Celta consiguió por primera vez clasificarse para una competición europea. A lo largo de su historia también atravesó etapas complicadas, con ascensos, descensos y nuevas oportunidades para volver a crecer. En los años noventa, el equipo regresó a las finales de Copa y comenzó a ganar protagonismo en Europa.

El cambio de siglo trajo grandes noches para el celtismo. En el año 2000, el Celta conquistó la Copa Intertoto y, en 2004, logró clasificarse para la Champions League después de finalizar cuarto en Liga. Años más tarde, el ascenso de 2012 y la agónica permanencia de 2013 demostraron la capacidad del equipo para luchar hasta el final.

En 2017, el Celta alcanzó las semifinales de la Copa del Rey y de la Europa League, quedándose cerca de disputar ambas finales. En 2023 celebró su centenario, cien años de historia compartida con Vigo y Galicia. En 2025, con numerosos canteranos y Claudio Giráldez al frente, volvió a competir en Europa.

Hoy, el Celta representa mucho más que un equipo de fútbol: es una parte de la identidad de Vigo y de Galicia. Una historia construida con esfuerzo, sentimiento y orgullo, que continúa escribiéndose con cada generación de jugadores y aficionados. Porque ser celeste es llevar consigo el orgullo dunha terra.`,
},


  // 5. DEPORTIVO ALAVÉS
  'deportivo alaves': {
    titulo: 'El Glorioso, el alma de Vitoria',
    descripcion: `El Deportivo Alavés nació en Vitoria-Gasteiz a partir del Sport Friend's Club, una entidad creada en 1920. El 23 de enero de 1921 adoptó el nombre de Club Deportivo Alavés, comenzando una historia que acabaría convirtiéndolo en uno de los grandes símbolos deportivos de Álava.

Durante sus primeros años, el equipo fue creciendo hasta alcanzar uno de los hitos más importantes de su historia. En la temporada 1929/30 se proclamó campeón de su categoría y consiguió el ascenso a Primera División. Fue entonces cuando comenzó a popularizarse el apodo de 'El Glorioso', una denominación que acompañaría al club durante generaciones.

El Alavés se fue haciendo un hueco en el fútbol español, aunque su trayectoria no siempre fue sencilla. A lo largo de las décadas tuvo que afrontar descensos, dificultades económicas y etapas alejadas de la élite. Sin embargo, el apoyo de sus aficionados y su vínculo con Vitoria-Gasteiz mantuvieron vivo el sentimiento albiazul. Mendizorroza se convirtió en el punto de encuentro de una afición que nunca dejó de creer en su equipo.

En 1998, el Deportivo Alavés regresó a Primera División después de muchos años de ausencia. Aquel ascenso marcó el inicio de una de las etapas más recordadas de su historia, con un equipo que empezó a competir contra algunos de los clubes más importantes del país y a hacerse un nombre en el fútbol europeo.

La temporada 2000/01 quedó grabada para siempre en la memoria alavesista. El equipo debutó en la Copa de la UEFA y avanzó ronda tras ronda hasta alcanzar la final contra el Liverpool, disputada en Dortmund el 16 de mayo de 2001. En un encuentro extraordinario, el Alavés luchó hasta el último instante y llevó el partido hasta la prórroga. Finalmente, cayó por 5-4, pero su actuación convirtió aquella noche en una de las páginas más emocionantes de su historia y en un motivo de orgullo para toda Vitoria.

En 2017, el club volvió a vivir una gran cita al alcanzar la final de la Copa del Rey frente al Barcelona. Aunque no pudo conquistar el trofeo, llegar hasta aquella final confirmó la capacidad del equipo para competir al máximo nivel y devolver la ilusión a su afición.

En 2021, el Deportivo Alavés celebró su centenario, cien años de fútbol, esfuerzo y sentimiento albiazul. Durante todo ese tiempo, el club ha alternado grandes éxitos con momentos difíciles, pero ha mantenido una conexión especial con su ciudad y su territorio.

Hoy, el Deportivo Alavés representa mucho más que un equipo de fútbol. Es parte de la identidad de Vitoria-Gasteiz, el orgullo de Álava y el recuerdo compartido de generaciones que han acompañado al Glorioso en las buenas y en las malas. Porque la historia de este club no se explica solamente por sus resultados, sino por una afición que nunca deja de sentir sus colores.`,
  },



  // 6. ELCHE CF
  'elche cf': {
    titulo: 'El sentimiento franjiverde',
    descripcion: `El Elche Club de Fútbol nació en 1923, fruto del deseo de los ilicitanos de contar con un equipo que representara a su ciudad. Desde sus primeros partidos, el club fue construyendo una identidad propia, estrechamente ligada a Elche y a sus habitantes. Sus primeros años estuvieron marcados por el crecimiento en el fútbol regional y por la búsqueda de un lugar entre los grandes equipos.

En 1926 se inauguró el campo de Altabix, que durante más de cincuenta años sería el hogar del equipo. Poco después, el entrenador checo Anton Fivber introdujo la franja horizontal verde en la camiseta blanca. Aquel detalle acabaría convirtiéndose en el símbolo más reconocible del club y daría nombre a una afición que se siente orgullosa de sus colores: la franjiverde.

En 1935, el Elche consiguió su primer ascenso a Segunda División. Sin embargo, consolidarse en las categorías superiores no fue sencillo. El club tuvo que superar dificultades deportivas y económicas, y uno de los episodios más especiales de aquella etapa fue la Cooperativa, una fórmula en la que los propios jugadores colaboraron para ayudar a mantener viva la entidad. El apoyo de la ciudad fue fundamental para que el Elche continuara avanzando.

La temporada 1958/59 cambió la historia del club. Bajo la dirección de César Rodríguez y con José Esquitino Sempere en la presidencia, el equipo consiguió dos ascensos consecutivos, primero a Segunda División y después a Primera. El 19 de abril de 1959, una victoria por 0-3 ante el Tenerife aseguró por primera vez el ascenso a la máxima categoría. El Elche había alcanzado la élite y comenzaba una de las etapas más brillantes de su trayectoria.

Durante los años sesenta, el conjunto franjiverde se consolidó en Primera División y llegó a convertirse en uno de los equipos destacados del fútbol español. En la temporada 1963/64 logró la mejor clasificación liguera de su historia hasta entonces, al terminar en quinta posición. Aquella generación de futbolistas convirtió Altabix en un estadio difícil para sus rivales y llenó de ilusión a toda la afición ilicitana.

El momento más emblemático de aquella época llegó en 1969. Después de superar varias eliminatorias, el Elche alcanzó por primera vez la final de la Copa, disputada el 15 de junio en el Santiago Bernabéu frente al Athletic Club. Aunque el equipo perdió por 1-0, aquella final representó un logro extraordinario y llevó el nombre de Elche a uno de los escenarios más importantes del fútbol nacional. Miles de aficionados acompañaron al equipo en una jornada que permanece en la memoria franjiverde.

En 1976, el club dejó atrás el histórico campo de Altabix para trasladarse al nuevo estadio Martínez Valero, que se convirtió en su casa y en el escenario de nuevas generaciones de futbolistas. Desde entonces, el Elche ha vivido ascensos, descensos y regresos a Primera División, demostrando una y otra vez su capacidad para superar las dificultades y volver a competir entre los mejores.

A lo largo de su historia, el club ha mantenido una relación especial con su ciudad. Sus colores, su estadio y los recuerdos compartidos por varias generaciones forman parte de la identidad ilicitana. Cada ascenso y cada gran partido han reforzado el vínculo entre el equipo y una afición que nunca ha dejado de acompañarlo.

Hoy, el Elche CF representa mucho más que fútbol. Es una parte de la historia y del sentimiento de Elche, una franja verde sobre una camiseta blanca que une a jugadores y aficionados bajo los mismos colores. Porque ser franjiverde es sentir el orgullo de una ciudad y mantener viva una pasión que continúa pasando de generación en generación.`,
  },


  // 7. FC BARCELONA
  'fc barcelona': {
    titulo: 'Més que un club, un sentiment',
    descripcion: `El FC Barcelona nació el 29 de noviembre de 1899 gracias a la iniciativa de Hans Gamper, conocido en Cataluña como Joan Gamper, y de un grupo de jóvenes futbolistas. Desde sus primeros años, el club quiso representar a la ciudad de Barcelona y convertirse en una entidad abierta a personas de diferentes procedencias. Sus colores azul y grana pronto se convirtieron en una seña de identidad que acompañaría al barcelonismo a lo largo de generaciones.

Durante sus primeras décadas, el Barça fue creciendo tanto en el terreno de juego como en número de socios. En 1902 conquistó la Copa Macaya, uno de sus primeros grandes éxitos, y en 1909 estrenó el campo de la calle de la Industria, que ayudó a impulsar el crecimiento de la entidad. Más adelante, el equipo se trasladó a Les Corts, un estadio que se convirtió en el escenario de una época dorada durante los años veinte, con jugadores que despertaron una enorme pasión entre los aficionados.

La Guerra Civil española y la posguerra marcaron una etapa especialmente difícil para el club. La muerte de Joan Gamper en 1930 y la represión de aquellos años dejaron una profunda huella en la entidad. A pesar de las dificultades, el Barça consiguió mantenerse en pie gracias a sus socios y seguidores, que continuaron defendiendo sus colores y su identidad.

En los años cincuenta, la llegada de Ladislao Kubala transformó al equipo y atrajo a una gran cantidad de aficionados. El crecimiento del barcelonismo hizo necesaria la construcción de un estadio más grande, y el 24 de septiembre de 1957 se inauguró el Camp Nou, que se convertiría en la casa del club y en uno de los estadios más emblemáticos del fútbol mundial.

Durante las décadas siguientes, el Barça vivió nuevas etapas de crecimiento deportivo y social. En 1968, el presidente Narcís de Carreras popularizó la expresión 'Més que un club', que resumía la relación especial entre la entidad, Cataluña y sus seguidores. La llegada de Johan Cruyff como jugador en 1973 devolvió la ilusión a la afición y ayudó al equipo a conquistar la Liga de la temporada 1973/74, poniendo fin a una larga espera por el título.

En 1988, Cruyff regresó como entrenador y comenzó una de las etapas más importantes de la historia azulgrana. Su equipo, conocido como el Dream Team, conquistó cuatro Ligas consecutivas y alcanzó uno de los mayores sueños del barcelonismo: ganar la primera Copa de Europa del club. El 20 de mayo de 1992, un gol de Ronald Koeman en la final de Wembley dio al Barça el título europeo frente a la Sampdoria. Aquella victoria quedó grabada para siempre en la memoria de los culés.

La llegada del nuevo siglo trajo una generación de futbolistas que cambiaría la historia del fútbol. Con jugadores como Xavi Hernández, Andrés Iniesta, Carles Puyol y Lionel Messi, el Barça construyó un equipo capaz de dominar tanto en España como en Europa. En 2006 conquistó la Champions League en París y, en la temporada 2008/09, bajo la dirección de Pep Guardiola, consiguió el primer triplete de su historia, ganando la Liga, la Copa del Rey y la Champions League.

En 2009, el equipo alcanzó otro hito extraordinario al conquistar los seis títulos posibles del año natural. Aquel Barça destacó por su fútbol de posesión, su presión colectiva y la importancia de los jugadores formados en La Masia. Durante los años siguientes, el club continuó sumando títulos y protagonizando noches inolvidables, entre ellas la conquista de una nueva Champions League en 2011 y el triplete de la temporada 2014/15, con Luis Enrique en el banquillo y Messi, Neymar y Luis Suárez en ataque.

En los años posteriores, el club tuvo que afrontar cambios deportivos y dificultades económicas, además de despedir a figuras fundamentales de su historia. En 2021, Lionel Messi dejó el Barça después de más de veinte años vinculado a la entidad, cerrando una etapa irrepetible. Sin embargo, la apuesta por los jóvenes de La Masia y la llegada de nuevas generaciones permitieron renovar la ilusión de los aficionados.

En 2023, el equipo masculino volvió a conquistar la Liga y la Supercopa de España, mientras que el fútbol femenino siguió ampliando el palmarés azulgrana con grandes éxitos nacionales e internacionales. En 2024, el club celebró su 125.º aniversario, recordando más de un siglo de historia, esfuerzo, títulos y compromiso con sus raíces.

Hoy, el FC Barcelona es una entidad reconocida en todo el mundo, pero su historia va mucho más allá de los trofeos. Es el recuerdo de generaciones de jugadores, el orgullo de sus socios, el talento formado en La Masia y la pasión de millones de aficionados que sienten los colores azul y grana como parte de su vida. Porque el Barça no es solamente un equipo de fútbol: es una historia compartida, una identidad y un sentimiento que sigue pasando de generación en generación. Més que un club, un sentiment.`,
  },



  // 8. GETAFE CF
  'getafe cf': {
    titulo: 'Humildad, lucha y sentimiento',
    descripcion: `La historia del fútbol en Getafe comenzó mucho antes de que el club actual alcanzara la élite. En 1946 se fundó el Club Getafe Deportivo, que representó durante años a la ciudad y sentó las bases de una afición que quería ver a su equipo crecer. Tras la desaparición de aquella entidad, el 8 de julio de 1983 nació el Getafe Club de Fútbol, dispuesto a continuar el camino del fútbol getafense.

Los primeros años del nuevo club estuvieron marcados por el esfuerzo y la perseverancia. El equipo fue avanzando por las categorías del fútbol español, superando dificultades deportivas y económicas. Durante mucho tiempo, el objetivo fue consolidarse y conseguir que el nombre de Getafe tuviera cada vez más presencia en el panorama futbolístico nacional.

En los años noventa, el club vivió etapas complicadas, pero también empezó a demostrar su capacidad para levantarse. Los ascensos y las promociones se convirtieron en pruebas de carácter para una entidad que nunca dejó de luchar. La inauguración del Coliseum en 1998 supuso un paso importante: el equipo tenía una nueva casa desde la que seguir creciendo junto a su afición.

En 1999, el Getafe consiguió ascender a Segunda División, aunque todavía quedaba mucho camino por recorrer. Tras regresar a Segunda B, el equipo volvió a luchar por recuperar la categoría y lo consiguió en 2002. A partir de entonces, el club comenzó a mirar cada vez más alto, con la ilusión de alcanzar una meta que parecía lejana: jugar en Primera División.

El 19 de junio de 2004 llegó el día que cambió la historia azulona. El Getafe venció al Tenerife por 3-5 en el estadio Heliodoro Rodríguez López y consiguió por primera vez el ascenso a Primera División. Sergio Pachón fue el gran protagonista al marcar cuatro goles en aquel encuentro inolvidable. Aquella gesta dio origen a la expresión 'El Espíritu de Tenerife', símbolo de lucha, unión y confianza hasta el último minuto.

Ya en la máxima categoría, el Getafe demostró que podía competir contra clubes con mucha más historia y recursos. En la temporada 2006/07 alcanzó por primera vez la final de la Copa del Rey, después de protagonizar una remontada memorable frente al Barcelona en semifinales. Aunque perdió la final ante el Sevilla, el equipo confirmó que había llegado para hacerse un sitio entre los grandes.

La temporada 2007/08 fue todavía más especial. El Getafe disputó su primera campaña europea y avanzó hasta los cuartos de final de la Copa de la UEFA. Allí se enfrentó al Bayern de Múnich en una eliminatoria que quedó grabada en la memoria de los aficionados. Después del empate en Alemania, el partido de vuelta en el Coliseum fue una auténtica batalla futbolística. El Getafe llegó a ponerse por delante y estuvo muy cerca de eliminar al conjunto alemán, pero el Bayern logró igualar en los últimos instantes de la prórroga y avanzó por el valor de los goles fuera de casa. A pesar de la eliminación, aquella actuación convirtió al Getafe en uno de los equipos más recordados de aquella edición europea.

En abril de 2008, el club disputó su segunda final de la Copa del Rey, esta vez frente al Valencia. Aunque no consiguió levantar el trofeo, llegar a dos finales consecutivas confirmó la dimensión que había alcanzado el proyecto azulón en muy pocos años.

Después de aquella etapa dorada, el Getafe siguió alternando buenas temporadas con momentos difíciles. En 2016 descendió a Segunda División, pero la respuesta del equipo fue inmediata. En junio de 2017, logró regresar a Primera tras superar al Tenerife en la promoción de ascenso. La remontada en el Coliseum, con una victoria por 3-1, volvió a demostrar el carácter competitivo del club y reforzó la conexión con sus seguidores.

En las temporadas siguientes, el Getafe volvió a destacar en Primera División y regresó a las competiciones europeas. Su clasificación para la Europa League en 2019 le permitió vivir nuevas noches internacionales y enfrentarse a rivales de gran nivel. Una vez más, el club demostró que su crecimiento no había sido fruto de la casualidad, sino del trabajo, la constancia y la ambición.

Hoy, el Getafe CF representa el orgullo de una ciudad que ha acompañado al equipo en las buenas y en las malas. Su historia está llena de ascensos, remontadas y noches inolvidables, pero también de esfuerzo diario y fidelidad a unos colores. Porque ser del Getafe significa creer, luchar y seguir adelante incluso cuando el camino se complica. Humildad, lucha y sentimiento: tres palabras que resumen el espíritu azulón.`,
  },

  // 9. LEVANTE UD
  'levante ud': {
    titulo: 'Orgull granota, orgull de València',
    descripcion: `La historia del Levante UD es una historia de tradición, resistencia y sentimiento por unos colores que forman parte de la identidad de València. Sus raíces se remontan a 1909, cuando comenzaron a desarrollarse dos clubes fundamentales para el fútbol valenciano: el Levante F.C. y el Gimnástico F.C. Aunque cada uno siguió su propio camino durante sus primeros años, ambos acabarían formando parte de una misma historia.

    Durante las décadas de 1920 y 1930, los dos equipos fueron creciendo y consiguieron sus primeros éxitos deportivos. Uno de los capítulos más destacados llegó en 1937, cuando el Levante F.C. conquistó la Copa de la España Libre, un título muy importante dentro de la memoria histórica del club. Aquella etapa dejó una huella que todavía forma parte del orgullo granota.

    En 1939, tras la Guerra Civil, el Levante F.C. y el Gimnástico F.C. se fusionaron para dar origen a la Unión Deportiva Levante-Gimnástico. Dos años después, en junio de 1941, la entidad adoptó definitivamente el nombre de Levante Unión Deportiva. De esta unión surgió el club que conocemos hoy, con los colores azulgranas vinculados al Gimnástico y el nombre Levante como seña de identidad.

    El camino hacia la élite no fue sencillo. El equipo tuvo que superar numerosas dificultades deportivas y económicas antes de alcanzar uno de sus grandes objetivos: el ascenso a Primera División en junio de 1963. A finales de aquella década también se trasladó al estadio Antonio Román, conocido actualmente como Ciutat de València, que se convertiría en uno de los grandes símbolos de la entidad y de su afición.

    En los años siguientes, el Levante vivió etapas complicadas, con descensos y temporadas lejos de la máxima categoría. Sin embargo, el apoyo de sus seguidores y el sentimiento por el escudo mantuvieron vivo al club. El regreso a Primera División en la temporada 2003-2004 puso fin a una larga espera, aunque todavía quedaban nuevos retos y dificultades por superar.

    La temporada 2010-2011 supuso otro momento histórico, con una nueva permanencia en Primera División que confirmó la capacidad del equipo para competir entre los grandes. En la campaña 2011-2012, el Levante firmó una de las mejores temporadas de su historia: llegó a liderar la clasificación durante varias jornadas, terminó en sexta posición y consiguió clasificarse por primera vez para una competición europea. Más adelante, también alcanzó las semifinales de la Copa del Rey.

    A lo largo de su historia, el Levante UD ha demostrado que un club no se define únicamente por sus títulos o por la categoría en la que juega. Sus raíces, su capacidad para levantarse después de los momentos difíciles y la fidelidad de su afición forman parte esencial de su identidad. El Ciutat de València y los colores azulgranas representan el vínculo entre generaciones de seguidores que han mantenido vivo el sentimiento granota.

    Desde sus orígenes en 1909 hasta la actualidad, el Levante UD continúa siendo una parte importante de la historia deportiva valenciana. Una historia construida con esfuerzo, orgullo y pasión, que explica por qué ser granota significa mucho más que apoyar a un equipo: significa llevar València en el corazón.`
  },


  // 10. MÁLAGA CF
  'malaga cf': {
    titulo: 'La Bombonera de la Costa del Sol',
    descripcion: `La historia del fútbol en Málaga comenzó el 3 de abril de 1904, cuando se disputó uno de los primeros partidos documentados de la ciudad. A partir de aquel momento surgieron diferentes clubes que fueron construyendo la tradición futbolística malagueña. Entre ellos estuvieron el Málaga Football Club, el FC Malagueño y el Club Deportivo Malacitano, entidades que forman parte de los orígenes del actual Málaga CF.

    En 1941 se produjo un momento fundamental con la llegada del Club Deportivo Málaga y la inauguración oficial del estadio de La Rosaleda, el 14 de septiembre de ese mismo año. El nuevo estadio se convirtió en la casa del fútbol malagueño y en un lugar muy especial para varias generaciones de aficionados. Durante las décadas siguientes, el CD Málaga alternó temporadas en Primera y Segunda División, consiguiendo importantes ascensos y dejando una huella profunda en la ciudad.

    Tras muchos años de historia, cambios de nombre y dificultades económicas, el 29 de junio de 1994 nació oficialmente el Málaga Club de Fútbol como sociedad anónima deportiva, tomando el relevo del Club Atlético Malagueño. El nuevo proyecto comenzó desde las categorías inferiores del fútbol español, con el objetivo de devolver al equipo a las grandes competiciones. El ascenso a Segunda División en 1997 y, posteriormente, a Primera División en 1999 marcaron el comienzo de una etapa muy ilusionante.

    El Málaga CF consiguió consolidarse en la máxima categoría y empezó a vivir algunos de los mejores años de su historia. En 2002 conquistó la Copa Intertoto de la UEFA, un título que le permitió acceder a la Copa de la UEFA durante la temporada 2002-2003. Su participación europea fue una muestra del crecimiento deportivo del club y de su capacidad para competir frente a equipos de otros países.

    Después de varias temporadas de cambios y dificultades, el Málaga volvió a Primera División en 2008. Poco después comenzó una nueva etapa que llevó al equipo a alcanzar algunos de los mayores logros de su historia. En la temporada 2011-2012 terminó cuarto en Primera División y consiguió clasificarse para la Liga de Campeones de la UEFA, un hito que llenó de ilusión a toda la afición malaguista.

    La temporada 2012-2013 quedó grabada para siempre en la memoria del malaguismo. El equipo debutó en la Liga de Campeones y realizó una competición extraordinaria, superando la fase de grupos y alcanzando los cuartos de final. Su recorrido europeo convirtió al Málaga en uno de los equipos más destacados de aquella edición y llevó el nombre de la ciudad a algunos de los escenarios más importantes del fútbol continental.

    La historia del club también ha estado marcada por momentos complicados, especialmente durante los años posteriores, cuando tuvo que afrontar problemas económicos, cambios deportivos y el descenso de categoría. A pesar de las dificultades, la afición siguió acompañando al equipo y demostrando el fuerte vínculo que existe entre el Málaga CF y su ciudad. La Rosaleda continuó siendo el punto de encuentro de miles de malaguistas que nunca dejaron de animar a sus colores.

    En los últimos años, el club ha vivido nuevos retos deportivos, incluido el descenso a Primera Federación en 2023 y el posterior ascenso a Segunda División en 2024, celebrado como una gran alegría por su afición. Cada regreso ha reforzado la unión entre el equipo y una hinchada que se ha mantenido fiel incluso en las etapas más difíciles.

    Desde los primeros partidos disputados en Málaga en 1904 hasta las grandes noches europeas, el camino del Málaga CF refleja la pasión de una ciudad por el fútbol. La Rosaleda, los colores blanquiazules y el apoyo de su gente forman parte de una identidad que va mucho más allá de los resultados. Porque el Málaga no es solo un equipo: es el orgullo de su afición y la Bombonera de la Costa del Sol.`
  },


  // 11. RACING DE SANTANDER
  'racing de santander': {
    titulo: 'El orgullo de Cantabria',
    descripcion: `La historia del Real Racing Club de Santander comenzó en 1913, cuando un grupo de aficionados al fútbol decidió crear una entidad que representara a la ciudad. El 14 de junio de aquel año se constituyó oficialmente el club bajo el nombre de Santander Racing Club, con Ángel Sánchez Losada como primer presidente. Desde sus primeros pasos, el Racing fue creciendo hasta convertirse en uno de los grandes símbolos deportivos de Cantabria.

    Durante sus primeros años, el equipo fue construyendo su identidad y ganándose un lugar en el fútbol español. En 1928 participó en la primera edición de la Liga española, convirtiéndose en uno de los clubes fundadores de la competición. Aquella etapa supuso un reconocimiento al crecimiento del Racing y permitió que el nombre de Santander empezara a tener presencia entre los equipos más importantes del país.

    A lo largo de las décadas siguientes, el club vivió diferentes etapas deportivas, alternando buenos resultados con temporadas complicadas. En 1950 consiguió uno de sus primeros grandes hitos al lograr el ascenso a Primera División, despertando una enorme ilusión entre sus seguidores. El Racing continuó compitiendo durante años en distintas categorías, manteniendo siempre una estrecha relación con su ciudad y con los aficionados que acompañaban al equipo.

    Los Campos de Sport de El Sardinero se convirtieron en el gran punto de encuentro del racinguismo. Inaugurado en febrero de 1913, el estadio ha sido testigo de numerosas generaciones de futbolistas y seguidores. Sus gradas han vivido ascensos, victorias inolvidables y momentos difíciles, convirtiéndose en un lugar fundamental para comprender la identidad verdiblanca.

    Uno de los periodos más destacados de la historia reciente llegó durante la primera década de los años 2000. El Racing logró consolidarse en Primera División y compitió frente a algunos de los equipos más importantes del fútbol español. En la temporada 2007-2008 firmó una campaña extraordinaria, terminando sexto en la Liga y consiguiendo por primera vez la clasificación para una competición europea a través de su posición en el campeonato.

    En la temporada 2008-2009, el Racing disputó la Copa de la UEFA y se enfrentó a clubes de gran nivel internacional. Aquella aventura europea fue un motivo de orgullo para la afición y llevó el nombre de Cantabria a escenarios importantes del fútbol continental. Además, el equipo alcanzó en varias ocasiones las semifinales de la Copa del Rey, demostrando su capacidad para competir en las grandes citas.

    Sin embargo, la historia racinguista también ha estado marcada por momentos difíciles. Los problemas económicos y los descensos de categoría pusieron a prueba la resistencia del club y de sus seguidores. El Racing llegó a competir en categorías inferiores, lejos de los escenarios en los que había brillado años atrás, pero el apoyo de su afición nunca desapareció. La fidelidad de los racinguistas se convirtió en una de las principales fuerzas para mantener viva la ilusión de regresar a la élite.

    Tras varios años de lucha, el equipo fue recuperando su lugar en el fútbol profesional y volvió a alimentar el sueño de toda Cantabria. Cada ascenso y cada celebración demostraron que el Racing seguía siendo mucho más que un equipo: era un símbolo compartido por miles de personas. La conexión entre los jugadores, la grada y la tierra cántabra continuó siendo una de las señas de identidad del club.

    Más de un siglo después de su fundación, el Real Racing Club conserva el orgullo de representar a Santander y a Cantabria. Su historia está formada por grandes temporadas, dificultades superadas y una afición que ha permanecido fiel a los colores verdiblancos. Porque ser del Racing significa llevar a Cantabria en el corazón y defender unos colores que unen a generaciones enteras.`
  },



  // 12. RAYO VALLECANO
  'rayo vallecano': {
    titulo: 'Vallecas nunca se rinde',
    descripcion: `La historia del Rayo Vallecano comenzó el 29 de mayo de 1924, cuando nació la Agrupación Deportiva El Rayo en el barrio madrileño de Vallecas. El club surgió gracias a un grupo de personas que querían disfrutar del fútbol y representar a su barrio. Desde sus primeros años, el Rayo fue construyendo una identidad propia, muy ligada a sus vecinos y a una afición que siempre ha sentido los colores como algo especial.

    Durante sus primeras décadas, el equipo tuvo que superar dificultades económicas y deportivas para seguir creciendo. En 1947 adoptó el nombre de Agrupación Deportiva Rayo Vallecano. Poco después, en la temporada 1949-1950, incorporó la característica franja roja diagonal a su camiseta blanca, una imagen que acabaría convirtiéndose en una de las señas de identidad más reconocibles del fútbol español.

    En 1956, el Rayo consiguió ascender a Segunda División y comenzó a acercarse al fútbol profesional. El club continuó avanzando paso a paso hasta alcanzar uno de los grandes objetivos de su historia: el ascenso a Primera División en 1977. Aquel logro permitió al equipo competir por primera vez en la máxima categoría y llevó la ilusión de Vallecas a los estadios más importantes del país.

    El camino en Primera no siempre fue fácil. Durante las décadas siguientes, el Rayo alternó ascensos y descensos, pero nunca perdió su vínculo con el barrio. En 1976 se inauguró el actual Estadio de Vallecas, que se convirtió en el hogar de los rayistas y en un lugar donde la cercanía entre el equipo y su gente ha seguido siendo fundamental.

    A finales de los años noventa, el club vivió una etapa destacada. Tras regresar a Primera División en 1999, el Rayo consiguió clasificarse para la Copa de la UEFA en la temporada 2000-2001 gracias a su posición en la clasificación del juego limpio. Su aventura europea fue extraordinaria: el equipo superó varias eliminatorias y llegó hasta los cuartos de final, dejando el nombre de Vallecas en la memoria del fútbol continental.

    A pesar de aquellos éxitos, los años siguientes trajeron dificultades deportivas y económicas. El Rayo descendió de categoría y tuvo que luchar durante varias temporadas para recuperar su lugar en el fútbol profesional. La afición desempeñó un papel esencial durante aquella etapa, manteniendo vivo el sentimiento rayista incluso cuando el equipo atravesaba sus momentos más complicados.

    En 2011, el club regresó a Primera División y comenzó una nueva etapa en la máxima categoría. Durante las temporadas posteriores consiguió competir frente a equipos de mayor presupuesto y protagonizó campañas destacadas. En la temporada 2012-2013 terminó en una meritoria octava posición, una de sus mejores clasificaciones históricas en Primera División.

    La historia reciente también ha estado marcada por nuevos descensos y ascensos. El Rayo volvió a Primera en 2021 y continuó demostrando su capacidad para competir y sorprender a rivales de gran nivel. En la temporada 2022-2023 terminó en la zona alta de la clasificación y volvió a confirmar que el equipo podía hacerse un hueco entre los clubes más competitivos de la categoría.

    En 2024, el Rayo Vallecano celebró su centenario, cien años después de aquel primer paso dado en Vallecas. La celebración recordó a los jugadores, trabajadores, directivos y aficionados que han formado parte de una historia construida con esfuerzo, humildad y pasión. El centenario también puso de relieve la importancia del barrio, que continúa siendo inseparable de la identidad del club.

    El Rayo Vallecano es mucho más que un equipo de fútbol. Su franja roja, el Estadio de Vallecas y el apoyo de su afición representan una forma especial de vivir este deporte. A lo largo de su historia, el club ha demostrado que los momentos difíciles también forman parte del camino y que la unión con su gente puede mantener viva la ilusión generación tras generación. Porque en Vallecas, pase lo que pase, el Rayo nunca se rinde.`
  },


  // 13. RC DEPORTIVO
  'rc deportivo': {
    titulo: 'Riazor, onde nace a lenda',
    descripcion: `La historia del Real Club Deportivo de La Coruña comenzó en 1906, cuando el fútbol empezó a organizarse en la ciudad alrededor del Club Deportivo de la Sala Calvet. La entidad fue creciendo hasta constituirse oficialmente en enero de 1907 y, poco después, recibió el título de Real. Desde sus primeros años, el Deportivo se convirtió en una parte importante de la vida deportiva de A Coruña y comenzó a construir una identidad que uniría al equipo con varias generaciones de aficionados.

    En 1912, el club conquistó la Copa España, uno de los primeros grandes títulos de su historia. Durante las décadas siguientes, el Deportivo fue creciendo dentro del fútbol gallego y español. En 1929 participó en la primera temporada de la Liga española, comenzando su recorrido en Segunda División. Aunque el camino hacia la élite fue largo, el equipo continuó trabajando para convertirse en uno de los clubes más reconocidos de Galicia.

    El estadio de Riazor ha sido uno de los grandes símbolos del deportivismo. El primer campo del club se inauguró en 1909, mientras que el actual estadio municipal abrió sus puertas en 1944. A lo largo de los años, sus gradas han vivido ascensos, títulos, derrotas dolorosas y noches europeas inolvidables. Riazor se convirtió en el lugar donde la afición blanquiazul comparte su pasión y donde el Deportivo ha escrito algunos de los capítulos más importantes de su historia.

    En 1941, el Deportivo logró por primera vez el ascenso a Primera División, iniciando una etapa que le permitió enfrentarse de manera habitual a los mejores equipos del país. En la temporada 1949-1950 terminó en segunda posición, uno de los resultados más destacados de aquellos primeros años en la máxima categoría. Sin embargo, el club también tuvo que afrontar descensos y temporadas complicadas, alternando etapas de crecimiento con otras en las que recuperar su lugar entre los mejores se convirtió en el principal objetivo.

    El gran cambio llegó durante los años noventa, cuando el Deportivo comenzó a competir por los títulos más importantes. Con la llegada de jugadores como Bebeto y Mauro Silva, el equipo construyó una plantilla capaz de desafiar a los grandes del fútbol español. Así nació el conocido como Súper Dépor, un conjunto que sorprendió por su calidad, su carácter y su capacidad para competir por la Liga.

    En la temporada 1993-1994, el Deportivo estuvo muy cerca de conquistar su primer campeonato liguero, pero perdió el título en la última jornada. Aquel desenlace fue doloroso para la afición, aunque el equipo demostró que podía luchar de tú a tú con los clubes más poderosos. En 1995 llegó la recompensa con la conquista de la Copa del Rey, el primer gran título de aquella generación, seguida de la Supercopa de España.

    El momento más importante de la historia del club llegó en la temporada 1999-2000. Dirigido por Javier Irureta y con futbolistas como Fran, Djalminha, Makaay, Donato y Mauro Silva, el Deportivo completó una campaña extraordinaria y se proclamó campeón de Liga por primera vez. El 19 de mayo de 2000, la victoria por 2-0 ante el Espanyol en Riazor confirmó el título y desató una celebración histórica en A Coruña. Aquel triunfo convirtió al Dépor en uno de los pocos clubes que han conseguido conquistar la Liga española.

    Los éxitos continuaron durante los primeros años del nuevo siglo. En 2002, el Deportivo ganó de nuevo la Copa del Rey al derrotar al Real Madrid por 1-2 en el Santiago Bernabéu, en una final que pasó a la historia como el Centenariazo. También conquistó las Supercopas de España de 2000 y 2002. En Europa, el equipo se convirtió en un rival temido y disputó cinco ediciones consecutivas de la Liga de Campeones, alcanzando varias veces los cuartos de final y llegando hasta las semifinales en 2004.

    Aquella semifinal europea contra el Oporto terminó sin el esperado pase a la final, pero el recorrido del Deportivo dejó noches inolvidables. Una de las más recordadas fue la remontada frente al Milan en los cuartos de final de la Liga de Campeones de 2004. Tras perder 4-1 en la ida, el equipo ganó 4-0 en Riazor y consiguió una clasificación histórica. Aquella noche quedó como uno de los momentos más emocionantes del deportivismo y como una muestra del carácter competitivo del club.

    Después de sus años de gloria, el Deportivo tuvo que afrontar una etapa de dificultades económicas y deportivas. En 2011 descendió a Segunda División, aunque regresó a Primera al año siguiente. Durante las temporadas posteriores alternó ascensos y descensos, hasta que en 2018 volvió a abandonar la máxima categoría. Los años siguientes fueron especialmente duros, con un descenso a categorías inferiores que puso a prueba la fidelidad de la afición.

    A pesar de las dificultades, el deportivismo siguió llenando Riazor y apoyando al equipo. En 2024, el Deportivo consiguió regresar al fútbol profesional con su ascenso a Segunda División, devolviendo la ilusión a una ciudad que nunca había dejado de creer. En mayo de 2026, el club logró un nuevo ascenso a Primera División, culminando una etapa de reconstrucción y recuperando su lugar en la máxima categoría del fútbol español.

    La historia del RC Deportivo está formada por grandes títulos, noches europeas, momentos difíciles y una afición que ha permanecido fiel a sus colores. Desde sus orígenes en 1906 hasta sus grandes conquistas, el club ha demostrado que su identidad va mucho más allá de una clasificación. Riazor representa la memoria de generaciones de deportivistas, un lugar donde los sueños se hicieron realidad y donde continúa viva la pasión por el Dépor. Porque para A Coruña, el Deportivo no es solo un equipo: es una parte de su historia, de su orgullo y de su corazón.`
  },


  // 14. RCD ESPANYOL
  'rcd espanyol': {
    titulo: 'Perico fins al final',
    descripcion: `La historia del RCD Espanyol comenzó el 28 de octubre de 1900, cuando un grupo de estudiantes universitarios de Barcelona, encabezados por Ángel Rodríguez, fundó la Sociedad Española de Foot-Ball. El objetivo era crear un club que permitiera practicar este deporte, que empezaba a ganar popularidad en la ciudad. En 1901, la entidad pasó a llamarse Club Español de Foot-Ball y comenzó a construir una identidad propia que, con el paso del tiempo, se convertiría en el orgullo de miles de aficionados.

    En sus primeros años, el club consiguió sus primeros éxitos deportivos y fue creciendo dentro del fútbol catalán. En 1903 conquistó la Copa Macaya, uno de los primeros títulos de su historia. Aunque atravesó una etapa complicada que provocó la interrupción temporal de sus actividades en 1906, el equipo volvió a reorganizarse en 1909. En 1910 adoptó los colores blanquiazules que hoy lo identifican, y en 1912 recibió el título de Real, convirtiéndose en el Real Club Deportivo Espanyol.

    Durante las primeras décadas del siglo XX, el Espanyol se consolidó como uno de los clubes importantes del fútbol español. En 1923 inauguró el estadio de Sarrià, que se convirtió en su casa durante muchas décadas. En 1929 conquistó la Copa de España y, ese mismo año, participó en la primera edición de la Liga española. A lo largo de su historia, el club ha contado con grandes futbolistas, entre ellos Ricardo Zamora, uno de los primeros grandes ídolos del espanyolismo y una figura destacada del fútbol español.

    En 1940, el Espanyol volvió a conquistar la Copa de España, demostrando su capacidad para competir por los títulos nacionales. Durante las décadas siguientes, el equipo alternó buenas temporadas con etapas más difíciles, pero mantuvo su presencia en la élite y la fidelidad de una afición que fue transmitiendo el sentimiento perico de generación en generación.

    En los años ochenta, el club volvió a protagonizar una de las etapas más destacadas de su trayectoria. Bajo la dirección de Javier Clemente, el equipo realizó una gran temporada 1986-1987 y terminó en tercera posición en la Liga. Poco después llegó uno de los momentos más emocionantes de su historia: la final de la Copa de la UEFA de 1988. El Espanyol alcanzó la final tras una extraordinaria campaña europea, pero, después de ganar 3-0 en la ida frente al Bayer Leverkusen, perdió por el mismo resultado en la vuelta y acabó cayendo en la tanda de penaltis. La derrota fue dolorosa, aunque aquella aventura quedó grabada en la memoria de la afición.

    Los años noventa trajeron nuevos desafíos. El club sufrió descensos y tuvo que trabajar para regresar a Primera División. En 1992 adoptó la forma jurídica de sociedad anónima deportiva, como otros clubes profesionales españoles. Tras superar varias dificultades, el Espanyol volvió a vivir una etapa de crecimiento y consiguió celebrar su centenario en 2000 con un nuevo título de Copa del Rey.

    El 27 de mayo de 2000, el Espanyol derrotó al Atlético de Madrid en la final de la Copa del Rey y conquistó un título que puso fin a una larga espera. Seis años después, en 2006, volvió a levantar el trofeo tras vencer al Real Zaragoza en la final disputada en el Santiago Bernabéu. Aquella victoria confirmó la capacidad del equipo para competir en las grandes citas y se convirtió en otra jornada inolvidable para el espanyolismo.

    En 2007, el Espanyol protagonizó una nueva aventura europea al alcanzar la final de la Copa de la UEFA. El equipo realizó un recorrido extraordinario y llegó al partido decisivo frente al Sevilla. Después de un encuentro muy disputado, la final terminó empatada y el Espanyol perdió en la tanda de penaltis. A pesar de no conseguir el título, aquella campaña demostró el nivel competitivo del club y dejó una huella importante en su historia.

    En agosto de 2009, el club inauguró su nuevo estadio, conocido actualmente como RCDE Stadium, dejando atrás el histórico campo de Sarrià y su posterior etapa en Montjuïc. El nuevo recinto se convirtió en el hogar de una afición que ha seguido acompañando al equipo en cada etapa de su trayectoria.

    Ese mismo año, el espanyolismo vivió uno de sus momentos más dolorosos con la muerte de Dani Jarque, capitán del primer equipo. Su recuerdo permanece profundamente unido a la identidad del club. El dorsal 21 se convirtió en un símbolo de homenaje y recuerdo, y la frase «Dani Jarque, siempre con nosotros» refleja el cariño que la afición continúa dedicándole.

    En los años posteriores, el Espanyol vivió nuevas clasificaciones europeas, descensos y ascensos. El equipo tuvo que afrontar etapas complicadas, pero logró regresar a Primera División en varias ocasiones gracias al trabajo de sus jugadores y al apoyo de sus seguidores. Cada regreso a la máxima categoría fue una muestra de la resistencia de un club que nunca ha dejado de luchar por sus objetivos.

    En 2025, el Espanyol celebró su 125 aniversario, recordando a todas las personas que han formado parte de su historia desde aquel primer grupo de estudiantes en Barcelona. La celebración sirvió para rendir homenaje a sus jugadores, entrenadores, trabajadores y, especialmente, a los aficionados que han mantenido vivo el sentimiento perico durante más de un siglo.

    La historia del RCD Espanyol está llena de títulos, finales europeas, momentos de alegría y dificultades que han puesto a prueba la fidelidad de su afición. Sus colores blanquiazules, sus estadios y el recuerdo de quienes han defendido el escudo forman parte de una identidad que se transmite de generación en generación. Porque ser perico significa acompañar al equipo en cualquier circunstancia, celebrar sus victorias y seguir creyendo cuando las cosas se complican. Perico fins al final.`
  },


  // 15. REAL BETIS
  'real betis': {
    titulo: 'Manquepierda, un sentimiento eterno',
    descripcion: `El Real Betis Balompié es uno de los clubes más queridos del fútbol español y una parte fundamental de la identidad de Sevilla. Su historia está marcada por los colores verdiblancos, la pasión de su afición y una forma de entender el fútbol que va mucho más allá de los resultados.

    Los orígenes del club se remontan a 1907, cuando un grupo de estudiantes fundó el Sevilla Balompié. En 1909 apareció el Betis Foot-ball Club, y en diciembre de 1914 ambos clubes aprobaron su fusión. Ese mismo año, Alfonso XIII concedió al Betis el título de «Real». En 1915 quedó oficializado el nombre de Real Betis Balompié, que se mantiene hasta nuestros días.

    Durante sus primeros años, el equipo fue creciendo poco a poco, aunque también tuvo que superar dificultades económicas y deportivas. A pesar de los problemas, consiguió consolidarse en el fútbol andaluz y comenzó a construir una identidad propia, acompañada por una afición que siempre estuvo a su lado.

    La década de 1930 fue una de las etapas más brillantes de su historia. En 1932, el Betis se proclamó campeón de Segunda División y se convirtió en el primer club andaluz en ascender a Primera. Poco después llegó el mayor éxito de aquellos años: el 28 de abril de 1935, el equipo dirigido por Patrick O'Connell conquistó la Liga tras vencer por 0-5 al Racing de Santander. Aquel título convirtió al Betis en campeón de España y quedó grabado para siempre en la memoria bética.

    Sin embargo, la Guerra Civil y sus consecuencias golpearon duramente al club. En 1940 descendió a Segunda División y, siete años después, cayó hasta Tercera. Fueron tiempos muy difíciles, en los que la supervivencia de la entidad dependió en gran medida del esfuerzo de sus seguidores. Lejos de abandonar al equipo, los béticos continuaron llenando el estadio y apoyándolo incluso en las categorías más bajas.

    De aquellos años nació una de las expresiones más conocidas del beticismo: «¡Viva el Betis manque pierda!». La frase representa la fidelidad de una afición que sigue animando tanto en los buenos momentos como en los malos. El regreso a Segunda en 1954 y el ascenso a Primera en 1958 fueron pasos decisivos para recuperar la ilusión y devolver al club al lugar que deseaba ocupar.

    Durante las décadas siguientes, el Betis alternó temporadas de éxitos con nuevos descensos y dificultades. En 1977 alcanzó otro momento histórico al ganar la primera Copa del Rey celebrada bajo esa denominación, después de una emocionante tanda de penaltis contra el Athletic Club. En los años ochenta volvió a competir en Europa y continuó reforzando su vínculo con una afición que nunca dejó de creer.

    En 1992, el club se convirtió en Sociedad Anónima Deportiva. Tras superar nuevos problemas económicos y deportivos, regresó a Primera División en 1994. La temporada 1996-1997 destacó por su tercer puesto en Liga y su llegada a la final de Copa. Más adelante, en 2005, el Betis volvió a levantar la Copa del Rey al vencer por 2-1 a Osasuna. Ese mismo año se convirtió en el primer equipo andaluz en clasificarse para disputar la Liga de Campeones en su formato moderno.

    Los años posteriores trajeron nuevas dificultades, incluido el descenso de 2009, pero el apoyo de sus seguidores volvió a ser decisivo. El equipo regresó a Primera en 2011 y continuó trabajando para recuperar su estabilidad y competir de nuevo al máximo nivel. Con el paso del tiempo, el club fue creciendo también en sus instalaciones, su estructura deportiva y su presencia en las competiciones europeas.

    En 2022, el Real Betis conquistó su tercera Copa del Rey al derrotar al Valencia en la tanda de penaltis, después de empatar 1-1 en la final. Fue una nueva celebración para una afición que llevaba años esperando volver a levantar un gran título. Durante esta etapa, el equipo también ha seguido participando en competiciones europeas y reforzando su presencia en el fútbol español.

    La historia del Real Betis no se explica únicamente a través de sus títulos. Se entiende por sus momentos de gloria, por las dificultades que ha superado y, sobre todo, por una afición que nunca ha dejado de acompañarlo. El verde y el blanco representan mucho más que unos colores: simbolizan el orgullo de un pueblo y una pasión transmitida de generación en generación.

    Porque ser bético significa estar con el equipo en cualquier circunstancia, celebrar cada victoria y seguir creyendo cuando las cosas se complican. Esa es la esencia del «manquepierda», un sentimiento que forma parte de la identidad del club y que mantiene viva su historia: **Manquepierda, un sentimiento eterno.**`,
  },

  // 16. REAL MADRID
  'real madrid': {
    titulo: 'Hasta el final, siempre Real',
    descripcion: `El Real Madrid Club de Fútbol es uno de los clubes más reconocidos de la historia del fútbol mundial. Fundado en Madrid el 6 de marzo de 1902, ha construido una trayectoria llena de títulos, grandes jugadores y noches inolvidables. Sus colores blancos se han convertido en un símbolo de ambición, esfuerzo y pasión por el fútbol.

    En sus primeros años, el club comenzó a crecer y a ganar reconocimiento dentro del fútbol español. En 1920, el rey Alfonso XIII le concedió el título de «Real», pasando a llamarse Real Madrid Foot-ball Club. Durante las décadas siguientes, el equipo fue consolidándose hasta convertirse en uno de los grandes protagonistas de las competiciones nacionales.

    En los años treinta llegaron los primeros grandes éxitos ligueros. El Real Madrid conquistó sus dos primeras Ligas en las temporadas 1931-1932 y 1932-1933. Sin embargo, la Guerra Civil española interrumpió la vida deportiva del país y afectó profundamente a la sociedad. Después de aquellos años difíciles, el club tuvo que reconstruirse y prepararse para una nueva etapa.

    Uno de los nombres más importantes de su historia es Santiago Bernabéu, que asumió la presidencia en 1943. Bajo su dirección, el club impulsó un ambicioso proyecto deportivo y comenzó la construcción de un estadio que llevaría su nombre. El nuevo campo se inauguró en 1947 y se convirtió en el hogar de generaciones de madridistas.

    La década de los cincuenta marcó el inicio de una época legendaria. Con jugadores como Alfredo Di Stéfano, Paco Gento, Ferenc Puskás, Raymond Kopa y José Santamaría, el Real Madrid formó uno de los equipos más recordados de todos los tiempos. En 1955 comenzó la Copa de Europa, una competición que el club ayudó a convertir en el gran escenario del fútbol continental.

    El equipo blanco ganó las cinco primeras ediciones de la Copa de Europa, desde 1956 hasta 1960. La final de 1960 quedó especialmente grabada en la historia: el Real Madrid venció al Eintracht de Frankfurt por 7-3 en Glasgow, con una actuación memorable de Di Stéfano y Puskás. En 1966 llegó la sexta Copa de Europa, con una nueva generación de futbolistas liderada por Paco Gento, que se convirtió en una de las grandes leyendas del club.

    Durante las décadas de los setenta y ochenta, el Real Madrid siguió ampliando su palmarés. Ganó numerosas Ligas y Copas nacionales y contó con equipos muy competitivos. En los años ochenta destacó la llamada Quinta del Buitre, formada por Emilio Butragueño, Manolo Sanchís, Martín Vázquez, Míchel y Miguel Pardeza, que dejó una huella importante en el fútbol español. En esa etapa también llegaron dos Copas de la UEFA consecutivas, en 1985 y 1986.

    En 1998, después de 32 años de espera, el Real Madrid volvió a conquistar la Copa de Europa al derrotar a la Juventus en la final disputada en Ámsterdam. El gol de Predrag Mijatović devolvió al club a lo más alto del fútbol europeo. Dos años después, el equipo ganó su octava Copa de Europa frente al Valencia, y en 2002 celebró la novena ante el Bayer Leverkusen, con el inolvidable gol de volea de Zinedine Zidane.

    A comienzos del siglo XXI, el club reunió a algunas de las mayores estrellas del fútbol mundial, como Zidane, Ronaldo Nazário, Luís Figo, David Beckham y Raúl. Aunque aquella etapa combinó grandes momentos con temporadas complicadas, el Real Madrid mantuvo su ambición de volver a dominar Europa. En 2006, el Santiago Bernabéu despidió a Alfredo Di Stéfano, una figura esencial para comprender la identidad y los éxitos del madridismo.

    En 2014, el equipo conquistó la décima Copa de Europa, conocida como «La Décima», tras vencer al Atlético de Madrid en Lisboa. Aquel título abrió una nueva etapa de éxitos internacionales. Bajo la dirección de Zinedine Zidane, el Real Madrid ganó tres Champions League consecutivas en 2016, 2017 y 2018, una hazaña extraordinaria que confirmó su capacidad para competir al máximo nivel en los momentos decisivos.

    En 2022, el club conquistó su decimocuarta Copa de Europa después de superar eliminatorias muy exigentes y vencer al Liverpool en la final de París. En 2024, volvió a levantar el trofeo continental tras derrotar al Borussia Dortmund en Londres, alcanzando su decimoquinta Copa de Europa. Aquellas campañas también estuvieron acompañadas de títulos nacionales y mundiales, con futbolistas como Luka Modrić, Toni Kroos, Karim Benzema, Vinícius Júnior y muchos otros protagonistas.

    El Real Madrid también ha destacado por su capacidad para renovarse y por la importancia de su cantera, que ha contribuido a formar jugadores y a mantener viva la identidad del club. El estadio Santiago Bernabéu y la Ciudad Real Madrid representan el crecimiento de una entidad que combina su historia con la voluntad de seguir avanzando.

    La trayectoria del Real Madrid está llena de victorias, dificultades, remontadas y momentos que han quedado en la memoria de sus seguidores. Su historia no se explica únicamente por la cantidad de títulos, sino también por la exigencia de luchar hasta el último minuto y por la ilusión que se transmite de una generación a otra.

    Para el madridismo, cada partido es una nueva oportunidad de defender el escudo y perseguir otro objetivo. Porque ser del Real Madrid significa creer hasta el final, incluso cuando todo parece complicado, y sentir orgullo por una historia que sigue escribiéndose. **Hasta el final, siempre Real.**`,
  },

  // 17. REAL SOCIEDAD
  'real sociedad': {
    titulo: 'Orgullo txuri-urdin',
    descripcion: `La Real Sociedad de Fútbol es uno de los clubes históricos del fútbol vasco y español. Fundada en Donostia-San Sebastián, representa el orgullo de Gipuzkoa y mantiene un vínculo muy especial con su afición y con la tierra a la que pertenece. Sus colores azul y blanco, conocidos como txuri-urdin, se han convertido en una seña de identidad que acompaña al equipo desde hace generaciones.

    Los orígenes del club se encuentran a comienzos del siglo XX, cuando el fútbol empezó a ganar popularidad en San Sebastián. En 1909, después de unos primeros años de actividad, los futbolistas decidieron constituir oficialmente la Sociedad de Fútbol. Ese mismo año, para disputar el Campeonato de España, el equipo compitió bajo el nombre de Club Ciclista de San Sebastián y conquistó su primer gran título al derrotar al Español de Madrid por 3-1 en la final de Copa.

    En 1910, el rey Alfonso XIII concedió al club el título de «Real», y desde entonces pasó a ser conocido como Real Sociedad de Fútbol. Durante sus primeros años, el equipo fue creciendo y ganando seguidores. En 1913 inauguró el campo de Atotxa, un estadio que se convertiría en un lugar emblemático para el club y en el escenario de muchas de sus grandes tardes de fútbol.

    Con la creación de la Liga española en 1929, la Real Sociedad pasó a competir en el nuevo campeonato nacional. El equipo se consolidó entre los conjuntos importantes del fútbol español y protagonizó temporadas destacadas, aunque también atravesó etapas complicadas. La Guerra Civil y sus consecuencias afectaron al deporte y a la sociedad, pero el club consiguió seguir adelante y mantener viva su actividad futbolística.

    Durante las décadas posteriores, la Real alternó buenos resultados con dificultades deportivas. Atotxa se convirtió en un campo muy querido por los aficionados, donde la cercanía de las gradas y el ambiente de la hinchada daban al equipo una personalidad propia. La fidelidad de sus seguidores fue fundamental para acompañarlo en los momentos difíciles y celebrar cada paso adelante.

    La década de los ochenta fue la época dorada del club. Bajo la dirección de Alberto Ormaetxea y con futbolistas destacados como Luis Arconada, Jesús María Zamora, Roberto López Ufarte y José Mari Bakero, la Real Sociedad construyó uno de los equipos más recordados de su historia. En la temporada 1979-1980 terminó la Liga como subcampeona y demostró que podía competir de tú a tú con los grandes del campeonato.

    En la temporada 1980-1981 llegó uno de los momentos más importantes de la historia txuri-urdin. La Real Sociedad conquistó su primera Liga, en una emocionante lucha por el título que se decidió en la última jornada. Lejos de conformarse con aquel éxito, el equipo volvió a proclamarse campeón en la temporada 1981-1982, logrando dos Ligas consecutivas y consolidándose como una de las grandes potencias del fútbol español. En 1982 también ganó la Supercopa de España.

    En 1987, la Real Sociedad volvió a levantar la Copa del Rey. Tras empatar 2-2 con el Atlético de Madrid en la final, el equipo donostiarra se impuso en la tanda de penaltis, con Luis Arconada como uno de los grandes protagonistas. Un año después, volvió a disputar la final de Copa y terminó la Liga como subcampeón, confirmando la calidad de aquella generación de futbolistas.

    En 1993, el club se despidió de Atotxa y comenzó una nueva etapa en el estadio de Anoeta, posteriormente conocido como Reale Arena. El cambio supuso el final de una época muy especial, pero también abrió una nueva etapa para la entidad. A lo largo de los años siguientes, la Real vivió temporadas de altibajos, incluido el descenso a Segunda División en 2007.

    En 2010, el equipo logró regresar a Primera División y comenzó a recuperar su lugar entre los clubes destacados del campeonato. El trabajo con los jóvenes futbolistas y el desarrollo de Zubieta, su ciudad deportiva, siguieron siendo elementos fundamentales de su identidad. La cantera ha tenido un papel muy importante en la historia de la Real, formando jugadores que han llegado al primer equipo y representado los valores del club.

    En la temporada 2019-2020, la Real Sociedad volvió a escribir una página inolvidable. El equipo conquistó la Copa del Rey al vencer al Athletic Club por 1-0 en la final disputada el 3 de abril de 2021, aplazada debido a la pandemia. Mikel Oyarzabal marcó el gol decisivo desde el punto de penalti. La celebración fue especialmente emotiva para una afición que llevaba décadas esperando volver a levantar este trofeo.

    En los años siguientes, la Real continuó compitiendo en la zona alta del fútbol español y regresó a la Liga de Campeones en la temporada 2023-2024. El club siguió apostando por una combinación de futbolistas formados en casa y jugadores de otros lugares, manteniendo una identidad reconocible y una forma de competir basada en el trabajo colectivo.

    La historia de la Real Sociedad está formada por títulos, generaciones inolvidables, momentos difíciles y una afición que nunca ha dejado de sentirse representada por sus colores. Desde las calles de Donostia hasta cada rincón de Gipuzkoa, el sentimiento txuri-urdin se transmite de padres a hijos y une a quienes comparten el orgullo de pertenecer a este club.

    Ser de la Real significa defender unos colores, confiar en el equipo y mantener viva una identidad que va mucho más allá del resultado de un partido. Es llevar el azul y el blanco con orgullo y recordar que cada generación contribuye a escribir un nuevo capítulo de esta historia. **Orgullo txuri-urdin.**`,
  },

  // 18. SEVILLA FC
  'sevilla fc': {
    titulo: 'El orgullo de Nervión',
    descripcion: `El Sevilla Fútbol Club es una de las entidades históricas del fútbol español y un símbolo deportivo de la ciudad de Sevilla. Fundado el 25 de enero de 1890, el club ha construido una trayectoria marcada por sus colores blanco y rojo, el carácter competitivo de sus equipos y la pasión de una afición que siente el sevillismo como parte de su identidad.

    Sus orígenes están relacionados con la presencia de ciudadanos británicos en Sevilla y con la expansión del fútbol a finales del siglo XIX. El 25 de enero de 1890 quedó constituido el Sevilla Football Club como asociación deportiva. El 8 de marzo de ese mismo año disputó un encuentro frente al Recreativo de Huelva, considerado uno de los primeros partidos de fútbol documentados entre clubes en España. En 1905, la entidad completó su inscripción oficial en el registro correspondiente, consolidando su organización.

    Durante las primeras décadas del siglo XX, el Sevilla FC se convirtió en uno de los grandes protagonistas del fútbol andaluz. Su dominio en la Copa de Andalucía fue especialmente destacado: conquistó 18 de las 21 ediciones disputadas entre 1915 y 1940. Aquellos éxitos ayudaron a consolidar el prestigio del club y a fortalecer su vínculo con la ciudad.

    En 1934, el equipo logró ascender a Primera División por primera vez. Un año después, en 1935, conquistó su primera Copa de España al derrotar al Sabadell en la final. En 1939 volvió a ganar el torneo, confirmando su capacidad para competir por los grandes títulos nacionales en una época marcada por las dificultades que atravesaba el país.

    La temporada 1945-1946 quedó grabada para siempre en la historia sevillista. El equipo ganó su primera y, hasta la fecha, única Liga española, después de completar una campaña extraordinaria. Aquel campeonato convirtió al Sevilla en uno de los grandes nombres del fútbol nacional. En 1948 llegó una nueva Copa de España, que reforzó el prestigio de una generación que dejó una huella importante en el club.

    En la década de los cincuenta se inauguró el estadio Ramón Sánchez-Pizjuán, llamado así en honor al presidente que impulsó el proyecto y que fue una figura fundamental en el crecimiento de la entidad. El estadio abrió sus puertas en 1958 y terminó convirtiéndose en el hogar de los sevillistas, escenario de grandes encuentros y símbolo de la identidad de Nervión.

    Las décadas siguientes combinaron momentos de ilusión con etapas complicadas. El Sevilla vivió descensos, ascensos y dificultades económicas, llegando a competir en Segunda División durante varios periodos. A pesar de ello, la afición mantuvo su apoyo al equipo y el club continuó trabajando para recuperar su lugar entre los principales conjuntos españoles.

    En los años noventa, la entidad afrontó una profunda transformación. En 1992 se convirtió en Sociedad Anónima Deportiva, dentro del proceso de adaptación del fútbol español a una nueva estructura empresarial. Tras comenzar el siglo XXI en Segunda División, el club inició una etapa de reconstrucción deportiva y organizativa que acabaría cambiando su historia.

    A partir de mediados de los años 2000, el Sevilla FC vivió una de las etapas más exitosas de su trayectoria. En 2006 conquistó la Copa de la UEFA al vencer al Middlesbrough por 4-0 en la final disputada en Eindhoven. Ese mismo año ganó la Supercopa de Europa frente al FC Barcelona. En 2007 volvió a proclamarse campeón de la UEFA, esta vez ante el Espanyol, y conquistó también la Copa del Rey y la Supercopa de España.

    En 2010, el Sevilla volvió a ganar la Copa del Rey al derrotar al Atlético de Madrid en la final. Poco después comenzó una nueva época dorada en Europa. Bajo la dirección de Unai Emery, el equipo conquistó tres Europa League consecutivas en 2014, 2015 y 2016. La final de 2014 frente al Benfica se decidió en los penaltis, mientras que en 2015 el Sevilla venció al Dnipro y en 2016 derrotó al Liverpool. Aquellos triunfos consolidaron al club como uno de los grandes especialistas de la competición.

    En 2020, el Sevilla FC conquistó su sexta Europa League tras vencer al Inter de Milán por 3-2 en una final disputada en Colonia. El equipo volvió a demostrar su capacidad para competir en las eliminatorias europeas y superar momentos difíciles. Tres años después, en 2023, levantó su séptimo título de la competición al derrotar a la Roma en la tanda de penaltis, después de empatar 1-1 en la final de Budapest.

    El club también ha contado con futbolistas que se han convertido en auténticos símbolos del sevillismo. Nombres como Jesús Navas, José Antonio Reyes, Frédéric Kanouté, Andrés Palop, Ivan Rakitić y muchos otros forman parte de una historia construida a base de esfuerzo, talento y compromiso. La cantera y el trabajo de formación han contribuido igualmente a mantener viva la identidad de la entidad.

    El Ramón Sánchez-Pizjuán representa mucho más que un estadio. Es el lugar donde generaciones de aficionados han celebrado victorias, sufrido derrotas y acompañado al equipo en todas las circunstancias. El himno oficial y el himno del Centenario, popularizado en 2005, se han convertido en símbolos de una afición que expresa su pasión con orgullo y que reconoce en Nervión el corazón del sevillismo.

    La historia del Sevilla FC demuestra que los grandes clubes se construyen con paciencia, esfuerzo y la fidelidad de quienes nunca dejan de creer. Desde sus primeros partidos a finales del siglo XIX hasta sus noches europeas más memorables, el equipo ha llevado el nombre de Sevilla por toda España y por Europa.

    Ser sevillista significa defender unos colores, compartir una pasión y sentir que cada partido forma parte de una historia colectiva. Es mantener vivo el orgullo de una ciudad y de una afición que siempre acompaña a su equipo. Porque en Nervión, el sentimiento no se explica: se vive. **El orgullo de Nervión.**`,
  },

  // 19. VALENCIA CF
  'valencia cf': {
    titulo: 'Amunt Valencia, sempre al teu costat',
    descripcion: `El Valencia Club de Fútbol es uno de los clubes históricos del fútbol español y uno de los grandes símbolos deportivos de la ciudad de Valencia. Fundado en 1919, ha construido una historia llena de títulos, grandes jugadores y momentos inolvidables. Sus colores blanco y negro representan a una afición que ha acompañado al equipo durante generaciones y que mantiene vivo el sentimiento valencianista.

    El origen del club se encuentra a principios del siglo XX, cuando el fútbol comenzó a ganar popularidad en Valencia. El 1 de marzo de 1919, un grupo de aficionados se reunió en el céntrico Bar Torino para dar forma al proyecto de crear un equipo que representara a la ciudad. La documentación se presentó en el Registro de Sociedades el 18 de marzo, fecha que se considera la fundación oficial del Valencia Football Club. Octavio Augusto Milego fue elegido como su primer presidente.

    El equipo disputó su primer partido el 21 de mayo de 1919 frente al Gimnástico valenciano, en Castellón. A finales de aquel año inauguró su primer campo propio, el Camp d'Algirós. El crecimiento del club hizo que aquel terreno se quedara pequeño y, en 1923, el Valencia comenzó a jugar en el Camp de Mestalla, un estadio que acabaría convirtiéndose en uno de los grandes símbolos del valencianismo.

    En 1929, el Valencia debutó en la Liga española. Poco después, en la temporada 1930-1931, consiguió ascender a Primera División. El equipo fue creciendo progresivamente y empezó a competir con los principales clubes del país. Sin embargo, la Guerra Civil española interrumpió la evolución del fútbol y dejó importantes daños en Mestalla, que tuvo que ser reconstruido y ampliado.

    La década de los cuarenta fue una de las primeras grandes épocas del club. En 1941, el Valencia conquistó su primera Copa de España, al vencer al RCD Español por 3-1 en la final. Un año después, en la temporada 1941-1942, ganó su primera Liga. Aquella generación, conocida por su extraordinaria delantera, contaba con futbolistas como Epi, Amadeo, Mundo, Asensi y Gorostiza. El equipo volvió a conquistar la Liga en 1944 y 1947, además de sumar nuevos títulos de Copa.

    Durante los años cincuenta, el Valencia continuó consolidándose entre los grandes del fútbol español. Mestalla fue ampliado para acoger a más aficionados y se convirtió en un estadio cada vez más importante. Jugadores como Antonio Puchades dejaron una huella profunda en la historia del club y ayudaron a mantener su competitividad en una época en la que el fútbol español estaba creciendo y transformándose.

    La década de los sesenta llevó al Valencia a conquistar Europa. En 1962 ganó la Copa de Ferias, precursora de la actual Europa League, tras imponerse al FC Barcelona en la final. En 1963 volvió a conquistar el mismo torneo, esta vez frente al Dinamo de Zagreb. Estos éxitos situaron al equipo entre los conjuntos destacados del fútbol continental y reforzaron el orgullo de una afición que empezaba a disfrutar de grandes noches europeas.

    En 1967, el Valencia volvió a levantar la Copa al derrotar al Athletic Club en la final. Años después, en la temporada 1970-1971, conquistó su cuarta Liga. El equipo dirigido por Alfredo Di Stéfano terminó primero en el campeonato y confirmó que el Valencia podía volver a competir por los títulos más importantes. Aquel triunfo se convirtió en uno de los momentos más recordados de la historia valencianista.

    A finales de los setenta llegó otra generación inolvidable, con Mario Alberto Kempes como gran protagonista. El delantero argentino, conocido por su capacidad goleadora, se convirtió en uno de los ídolos de Mestalla. En 1979, el Valencia ganó una nueva Copa del Rey al vencer al Real Madrid por 2-0. En 1980 conquistó la Recopa de Europa frente al Arsenal, en una final que terminó empatada sin goles y se decidió en la tanda de penaltis. Ese mismo año también ganó la Supercopa de Europa contra el Nottingham Forest.

    Los años siguientes estuvieron marcados por etapas de dificultad deportiva y económica. El club tuvo que afrontar una situación complicada y en 1986 descendió a Segunda División. Sin embargo, el Valencia regresó a Primera al año siguiente y continuó trabajando para recuperar su posición. En 1992 se convirtió en Sociedad Anónima Deportiva, iniciando una nueva etapa en su organización y gestión.

    Durante los años noventa, el equipo volvió a crecer y a competir por los primeros puestos. En 1999 ganó la Copa del Rey al derrotar al Atlético de Madrid por 3-0 y conquistó la Supercopa de España. Poco después, el Valencia protagonizó una de las etapas más brillantes de toda su historia, con una plantilla que combinaba talento, trabajo colectivo y una gran capacidad competitiva.

    En 2000 y 2001, el Valencia alcanzó dos finales consecutivas de la Liga de Campeones. Aunque no consiguió levantar el trofeo, aquellas campañas demostraron que el equipo podía competir con los mejores de Europa. En la temporada 2001-2002, bajo la dirección de Rafael Benítez, el Valencia conquistó su quinta Liga, poniendo fin a una espera de 31 años. Dos temporadas después, en 2003-2004, volvió a proclamarse campeón de Liga y ganó la Copa de la UEFA al derrotar al Olympique de Marsella por 2-0. En agosto de ese mismo año, añadió la Supercopa de Europa a su palmarés.

    En 2008, el Valencia conquistó su séptima Copa del Rey al vencer al Getafe por 3-1 en la final. A pesar de las dificultades que atravesó en distintas temporadas, el equipo continuó siendo uno de los clubes con mayor historia del fútbol español. Mestalla siguió siendo el escenario de grandes partidos y de una afición que nunca dejó de acompañar a sus jugadores.

    La temporada 2018-2019 fue especialmente importante, ya que el club celebró su centenario. La celebración culminó el 25 de mayo de 2019, cuando el Valencia ganó la Copa del Rey al derrotar al FC Barcelona por 2-1 en la final disputada en Sevilla. Los goles de Kevin Gameiro y Rodrigo Moreno dieron al equipo un título muy especial, conseguido en un año que quedaría grabado para siempre en la memoria valencianista.

    A lo largo de su historia, el Valencia ha contado con grandes futbolistas como Puchades, Mario Alberto Kempes, Fernando Gómez, Gaizka Mendieta, Pablo Aimar, David Albelda, David Villa y muchos otros. La cantera también ha desempeñado un papel importante, formando jugadores que han llegado al primer equipo y han contribuido a mantener la identidad del club.

    El Camp de Mestalla es mucho más que un estadio: es el lugar donde varias generaciones han celebrado títulos, sufrido derrotas y compartido su pasión por el Valencia. Sus gradas han sido testigo de grandes noches europeas y de momentos que forman parte de la memoria colectiva de la ciudad. El escudo, los colores y el sentimiento valencianista unen a seguidores de diferentes edades y mantienen viva la historia del club.

    Ser del Valencia significa acompañar al equipo en los buenos momentos y permanecer a su lado cuando llegan las dificultades. Significa defender unos colores que forman parte de la identidad de una ciudad y creer que siempre puede llegar una nueva oportunidad para volver a celebrar. Porque el valencianismo no se abandona: se lleva dentro, generación tras generación. **Amunt Valencia, sempre al teu costat.**`,
  },

  // 20. VILLARREAL CF
  'villarreal cf': {
    titulo: 'Endavant, orgull groguet',
    descripcion: `El Villarreal Club de Fútbol es uno de los clubes que más ha crecido en el fútbol español durante las últimas décadas. Situado en Vila-real, en la provincia de Castellón, representa el orgullo de una ciudad que ha acompañado al equipo desde sus primeros pasos hasta sus grandes noches europeas. Sus colores amarillos le han dado el apodo de «Submarino Amarillo», una identidad que comparten jugadores, aficionados y generaciones de seguidores.

    La historia del club comenzó el 10 de marzo de 1923, cuando un grupo de vecinos de Vila-real, impulsados por el farmacéutico José Calduch Almela, fundó el Club Deportivo Villarreal. Su objetivo era fomentar la práctica del fútbol y ofrecer a los habitantes de la localidad la oportunidad de disfrutar de este deporte. Ese mismo año se preparó el primer campo, conocido como Campo del Villarreal, que posteriormente recibiría el nombre de El Madrigal.

    En sus primeros años, el equipo participó principalmente en competiciones regionales y provinciales. El fútbol fue ganando popularidad en Vila-real y el club se convirtió en un punto de encuentro para la población. En la temporada 1935-1936, el equipo estuvo cerca de ascender a Segunda División, pero no consiguió superar la eliminatoria de promoción. Poco después, la Guerra Civil española interrumpió las competiciones y provocó graves dificultades para el deporte.

    En 1942, el Club Deportivo Villarreal desapareció tras atravesar una etapa muy complicada. Sin embargo, la pasión por el fútbol permaneció viva en la ciudad. En 1946 se creó el Club Atlético Foghetecaz, que años después adoptó el nombre de Club Atlético de Vila-real. En 1954, la entidad pasó a denominarse Villarreal Club de Fútbol, recuperando el nombre de la localidad y sentando las bases del club actual.

    En 1956, el Villarreal comenzó a utilizar la camiseta amarilla, que con el paso del tiempo se convertiría en su principal seña de identidad. El equipo fue avanzando por las categorías del fútbol español, compitiendo en torneos regionales y nacionales. En 1970 logró ascender a Tercera División, un paso importante para continuar creciendo y acercarse progresivamente al fútbol profesional.

    Durante las décadas siguientes, el club siguió avanzando con paciencia. En 1976 alcanzó la Segunda División B y, en 1990, consiguió por primera vez el ascenso a Segunda División. Aquella etapa permitió al Villarreal enfrentarse a nuevos desafíos y consolidar una estructura deportiva más ambiciosa. Aunque el camino estuvo lleno de dificultades, el apoyo de sus aficionados fue fundamental para mantener vivo el proyecto.

    En la temporada 1997-1998, el Villarreal logró ascender a Primera División por primera vez en su historia. La ciudad vivió una celebración inolvidable al ver cómo su equipo alcanzaba la máxima categoría del fútbol español. Aunque descendió al finalizar aquella primera campaña, el club regresó a Primera en 2000 y comenzó a establecerse entre los equipos más competitivos del campeonato.

    La llegada del siglo XXI marcó una transformación decisiva. Con Fernando Roig al frente de la entidad, el Villarreal reforzó su estructura deportiva y apostó por construir un proyecto capaz de competir con clubes de mayor tamaño. En la temporada 2003-2004, el equipo alcanzó las semifinales de la Copa de la UEFA y terminó la Liga en una posición destacada. En 2003 y 2004 también conquistó la Copa Intertoto, que le permitió seguir acumulando experiencia internacional.

    En 2005, el Villarreal llegó hasta las semifinales de la Copa de la UEFA y, en la temporada 2005-2006, protagonizó una de las mayores gestas de su historia al alcanzar las semifinales de la Liga de Campeones. Tras eliminar a equipos importantes, el conjunto amarillo se quedó a las puertas de la final frente al Arsenal. El penalti detenido por Jens Lehmann a Juan Román Riquelme en los últimos minutos de la eliminatoria quedó como uno de los momentos más recordados de aquella aventura europea.

    Durante las temporadas siguientes, el Villarreal confirmó su crecimiento. En la campaña 2007-2008 terminó la Liga en segunda posición, el mejor resultado liguero de su historia, y volvió a demostrar que podía competir con los grandes del fútbol español. Jugadores como Marcos Senna, Juan Román Riquelme, Diego Forlán, Giuseppe Rossi y Santi Cazorla contribuyeron a construir equipos que dejaron una huella importante en la memoria grogueta.

    El camino también tuvo momentos difíciles. En 2012, el Villarreal descendió a Segunda División después de una temporada muy complicada. Sin embargo, el club reaccionó y regresó a Primera en 2013. A partir de entonces volvió a clasificarse regularmente para las competiciones europeas, consolidando un modelo basado en el trabajo colectivo, la planificación deportiva y el desarrollo de futbolistas con talento.

    En la temporada 2015-2016, el equipo alcanzó las semifinales de la Europa League, confirmando su experiencia en los torneos continentales. Durante aquellos años, el Villarreal siguió creciendo tanto en el ámbito deportivo como en sus instalaciones. El estadio, conocido históricamente como El Madrigal, pasó a llamarse Estadio de la Cerámica en 2017, reforzando su vínculo con una de las actividades económicas más representativas de la zona.

    El momento más importante de la historia del club llegó en la temporada 2020-2021. Bajo la dirección de Unai Emery, el Villarreal conquistó su primera Europa League después de una campaña extraordinaria. En la final disputada en Gdansk, el equipo empató 1-1 frente al Manchester United y se impuso por 11-10 en una larguísima tanda de penaltis. Gerónimo Rulli detuvo el último lanzamiento y después marcó el suyo, dando al Submarino Amarillo el primer gran título europeo de su historia.

    Aquella victoria fue mucho más que un trofeo: representó la culminación de décadas de trabajo y el orgullo de una ciudad que había visto crecer a su equipo desde las categorías regionales. La conquista de la Europa League permitió al Villarreal disputar la Supercopa de Europa y regresar a la Liga de Campeones. En la temporada 2021-2022, el equipo volvió a sorprender al continente al alcanzar las semifinales de la Champions League, eliminando por el camino a la Juventus y al Bayern de Múnich antes de caer ante el Liverpool.

    A lo largo de su historia, el Villarreal ha contado con futbolistas que se han convertido en referentes para su afición, como Marcos Senna, Bruno Soriano, Santi Cazorla, Diego Forlán, Giuseppe Rossi, Gerard Moreno y muchos otros. El club también ha dado importancia a la formación de jóvenes jugadores y al trabajo de su cantera, manteniendo una conexión estrecha con Vila-real y con la provincia de Castellón.

    El Estadio de la Cerámica es el hogar del Submarino Amarillo y el escenario donde los aficionados han vivido ascensos, grandes victorias y noches europeas inolvidables. El crecimiento del club ha demostrado que una entidad de una ciudad pequeña puede alcanzar grandes objetivos mediante el trabajo, la ambición y el compromiso colectivo.

    La historia del Villarreal CF es una historia de superación. Desde sus orígenes humildes hasta levantar un título europeo, el club ha demostrado que el tamaño de una ciudad no determina la grandeza de sus sueños. El orgullo groguet se transmite de generación en generación y sigue impulsando al equipo a mirar hacia adelante.

    Porque ser del Villarreal significa creer en el proyecto, acompañar al equipo en los buenos y malos momentos y defender el amarillo con orgullo. Significa recordar todo lo que se ha conseguido y seguir soñando con nuevos capítulos para esta historia. **Endavant, orgull groguet.**`,
  },
}

// Algunos nombres de la base de datos pueden ser diferentes.
// Añade aquí cualquier otro nombre que utilice tu base de datos.
const aliasEquipos: Record<string, string> = {
  barcelona: 'fc barcelona',
  'atletico madrid': 'atletico de madrid',
  osasuna: 'osasuna',
  'ca osasuna': 'osasuna',
  'club atletico osasuna': 'osasuna',
  'celta de vigo': 'celta',
  alaves: 'deportivo alaves',
  elche: 'elche cf',
  getafe: 'getafe cf',
  levante: 'levante ud',
  malaga: 'malaga cf',
  'racing club': 'racing de santander',
  'racing de santander': 'racing de santander',
  'r. racing club': 'racing de santander',
  'real racing club': 'racing de santander',
  deportivo: 'rc deportivo',
  'deportivo de la coruna': 'rc deportivo',
  'rc deportivo de la coruna': 'rc deportivo',
  espanyol: 'rcd espanyol',
  'rcd espanyol de barcelona': 'rcd espanyol',
  betis: 'real betis',
  sevilla: 'sevilla fc',
  valencia: 'valencia cf',
  villarreal: 'villarreal cf',
  athletic: 'athletic club',
}

function normalizarNombre(nombre: string): string {
  return nombre
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// ───────── Presentación de la historia ─────────
// Divide el texto en párrafos y detecta el primer año de cada uno
// para dibujar una línea del tiempo. No modifica los textos de arriba.

const REGEX_ANIO = /\b(1[89]\d{2}|20[0-4]\d)\b/

interface Capitulo {
  titulo: string | null
  texto: string
  anio: string | null
}

// Un párrafo corto y sin punto final es un subtítulo (ej. "Una etapa de
// reconstrucción (1970-1980)") y se muestra como título del capítulo siguiente.
function esSubtitulo(parrafo: string): boolean {
  return (
    parrafo.length <= 90 &&
    !/[.!?:;,»”"]$/.test(parrafo) &&
    !parrafo.includes('**')
  )
}

function dividirEnCapitulos(descripcion: string): Capitulo[] {
  const parrafos = descripcion
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)

  const capitulos: Capitulo[] = []
  let anioAnterior = ''
  let titulo: string | null = null

  parrafos.forEach((texto, indice) => {
    const hayMasTexto = indice < parrafos.length - 1

    if (titulo === null && hayMasTexto && esSubtitulo(texto)) {
      titulo = texto
      return
    }

    const encontrado = `${titulo ?? ''} ${texto}`.match(REGEX_ANIO)?.[0] ?? ''

    // Si el año se repite seguido, solo se muestra la primera vez.
    capitulos.push({
      titulo,
      texto,
      anio: encontrado && encontrado !== anioAnterior ? encontrado : null,
    })

    if (encontrado) anioAnterior = encontrado
    titulo = null
  })

  return capitulos
}

function obtenerRangoAnios(descripcion: string): [number, number] | null {
  const anios = Array.from(
    descripcion.matchAll(new RegExp(REGEX_ANIO.source, 'g')),
    (coincidencia) => Number(coincidencia[0]),
  )

  if (anios.length === 0) return null
  return [Math.min(...anios), Math.max(...anios)]
}

// Convierte **texto** en negrita (así estaban escritos algunos finales).
function renderizarTexto(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, indice) =>
    trozo.length > 4 && trozo.startsWith('**') && trozo.endsWith('**') ? (
      <strong key={indice}>{trozo.slice(2, -2)}</strong>
    ) : (
      trozo
    ),
  )
}

function HistoriaEquipo({ equipo }: HistoriaEquipoProps) {
  const nombreNormalizado = normalizarNombre(equipo.nombre)
  const clave = aliasEquipos[nombreNormalizado] ?? nombreNormalizado
  const historia = historias[clave]

  const encabezado = (
    <header className="encabezado-bloque-equipo historia-encabezado">
      <span className="subtitulo">CONOCE EL CLUB</span>
      <h2>Historia del {equipo.nombre}</h2>
    </header>
  )

  if (!historia?.descripcion) {
    return (
      <section className="bloque-historia-equipo historia-club">
        {encabezado}
        <div className="mensaje-vacio">
          <span aria-hidden="true">📖</span>
          <h3>Historia en preparación</h3>
          <p>
            Estamos preparando la historia de este club. Próximamente
            encontrarás información sobre sus orígenes, su trayectoria y sus
            momentos más importantes.
          </p>
        </div>
      </section>
    )
  }

  const capitulos = dividirEnCapitulos(historia.descripcion)
  const rango = obtenerRangoAnios(historia.descripcion)
  const palabras = historia.descripcion.split(/\s+/).length
  const minutos = Math.max(1, Math.round(palabras / 200))

  // El último párrafo se destaca como cierre (si hay suficientes).
  const cierre = capitulos.length >= 3 ? capitulos[capitulos.length - 1] : null
  const linea = cierre ? capitulos.slice(0, -1) : capitulos

  return (
    <section className="bloque-historia-equipo historia-club">
      {encabezado}

      <div className="historia-cuerpo">
        <aside className="historia-ficha" aria-label="Datos del club">
          <h3>En un vistazo</h3>

          {rango && (
            <div className="historia-rango">
              <div>
                <strong>{rango[0]}</strong>
                <span>Primera fecha</span>
              </div>
              <div>
                <strong>{rango[1]}</strong>
                <span>Última fecha</span>
              </div>
            </div>
          )}

          <dl>
            {equipo.estadio && (
              <div>
                <dt>Estadio</dt>
                <dd>{equipo.estadio}</dd>
              </div>
            )}
            {equipo.ciudad && (
              <div>
                <dt>Ciudad</dt>
                <dd>{equipo.ciudad}</dd>
              </div>
            )}
            {equipo.entrenador && (
              <div>
                <dt>Entrenador</dt>
                <dd>{equipo.entrenador}</dd>
              </div>
            )}
            <div>
              <dt>Lectura</dt>
              <dd>
                {minutos} min · {capitulos.length} capítulos
              </dd>
            </div>
          </dl>
        </aside>

        <div className="historia-relato">
          {historia.titulo && (
            <blockquote className="historia-lema">
              <span className="historia-comillas" aria-hidden="true">
                “
              </span>
              <p>{historia.titulo}</p>
            </blockquote>
          )}

          <ol className="historia-linea">
            {linea.map((capitulo, indice) => (
              <li
                key={indice}
                className={
                  'historia-capitulo' +
                  (indice === 0 ? ' historia-capitulo--inicio' : '') +
                  (capitulo.anio ? ' historia-capitulo--anio' : '')
                }
              >
                {capitulo.anio && (
                  <span className="historia-anio">{capitulo.anio}</span>
                )}
                <span className="historia-punto" aria-hidden="true" />
                <div className="historia-contenido">
                  {capitulo.titulo && (
                    <h4 className="historia-subtitulo">{capitulo.titulo}</h4>
                  )}
                  <p className="historia-texto">
                    {renderizarTexto(capitulo.texto)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {cierre && (
            <div className="historia-cierre">
              <span className="subtitulo">Y LA HISTORIA CONTINÚA</span>
              {cierre.titulo && (
                <h4 className="historia-subtitulo">{cierre.titulo}</h4>
              )}
              <p>{renderizarTexto(cierre.texto)}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default HistoriaEquipo

/**
 * KisanTrust Frontend i18n (Internationalization)
 * 
 * Static translations for UI labels, buttons, headings etc.
 * The farmer's language preference (from Settings) drives the active language.
 */

export type Language = "english" | "hindi" | "marathi" | "punjabi" | "tamil" | "telugu" | "kannada" | "gujarati";

// All UI strings keyed by English
const translations: Record<string, Record<Language, string>> = {
  // --- Sidebar / Layout ---
  "Dashboard": { english: "Dashboard", hindi: "डैशबोर्ड", marathi: "डॅशबोर्ड", punjabi: "ਡੈਸ਼ਬੋਰਡ", tamil: "டாஷ்போர்டு", telugu: "డాష్‌బోర్డ్", kannada: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", gujarati: "ડેશબોર્ડ" },
  "Diagnose Crop": { english: "Diagnose Crop", hindi: "फसल निदान", marathi: "पीक निदान", punjabi: "ਫਸਲ ਨਿਦਾਨ", tamil: "பயிர் நோயறிதல்", telugu: "పంట నిర్ధారణ", kannada: "ಬೆಳೆ ರೋಗನಿರ್ಣಯ", gujarati: "પાક નિદાન" },
  "My Log": { english: "My Log", hindi: "मेरा लॉग", marathi: "माझा लॉग", punjabi: "ਮੇਰਾ ਲੌਗ", tamil: "எனது பதிவு", telugu: "నా లాగ్", kannada: "ನನ್ನ ಲಾಗ್", gujarati: "મારો લોગ" },
  "Score Details": { english: "Score Details", hindi: "स्कोर विवरण", marathi: "स्कोअर तपशील", punjabi: "ਸਕੋਰ ਵੇਰਵੇ", tamil: "மதிப்பெண் விவரங்கள்", telugu: "స్కోర్ వివరాలు", kannada: "ಸ್ಕೋರ್ ವಿವರಗಳು", gujarati: "સ્કોર વિગતો" },
  "Settings": { english: "Settings", hindi: "सेटिंग्स", marathi: "सेटिंग्ज", punjabi: "ਸੈਟਿੰਗਾਂ", tamil: "அமைப்புகள்", telugu: "సెట్టింగ్‌లు", kannada: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", gujarati: "સેટિંગ્સ" },
  "Logout": { english: "Logout", hindi: "लॉग आउट", marathi: "बाहेर पडा", punjabi: "ਲੌਗ ਆਊਟ", tamil: "வெளியேறு", telugu: "లాగ్ అవుట్", kannada: "ಲಾಗ್ ಔಟ್", gujarati: "લોગ આઉટ" },
  "Agri-Trust Score": { english: "Agri-Trust Score", hindi: "कृषि-ट्रस्ट स्कोर", marathi: "कृषी-ट्रस्ट स्कोर", punjabi: "ਖੇਤੀ-ਟ੍ਰਸਟ ਸਕੋਰ", tamil: "வேளாண் நம்பிக்கை மதிப்பெண்", telugu: "వ్యవసాయ-నమ్మకం స్కోర్", kannada: "ಕೃಷಿ-ಟ್ರಸ್ಟ್ ಸ್ಕೋರ್", gujarati: "કૃષિ-ટ્રસ્ટ સ્કોર" },

  // --- Greetings ---
  "Good morning": { english: "Good morning", hindi: "सुप्रभात", marathi: "सुप्रभात", punjabi: "ਸ਼ੁਭ ਸਵੇਰ", tamil: "காலை வணக்கம்", telugu: "శుభోదయం", kannada: "ಶುಭೋದಯ", gujarati: "સુપ્રભાત" },
  "Good afternoon": { english: "Good afternoon", hindi: "नमस्कार", marathi: "नमस्कार", punjabi: "ਸ਼ੁਭ ਦੁਪਹਿਰ", tamil: "மதிய வணக்கம்", telugu: "శుభ మధ్యాహ్నం", kannada: "ಶುಭ ಮಧ್ಯಾಹ್ನ", gujarati: "શુભ બપોર" },
  "Good evening": { english: "Good evening", hindi: "शुभ संध्या", marathi: "शुभ संध्याकाळ", punjabi: "ਸ਼ੁਭ ਸ਼ਾਮ", tamil: "மாலை வணக்கம்", telugu: "శుభ సాయంత్రం", kannada: "ಶುಭ ಸಂಜೆ", gujarati: "શુભ સાંજ" },
  "Your crop health dashboard is ready.": { english: "Your crop health dashboard is ready.", hindi: "आपका फसल स्वास्थ्य डैशबोर्ड तैयार है।", marathi: "तुमचे पीक आरोग्य डॅशबोर्ड तयार आहे.", punjabi: "ਤੁਹਾਡਾ ਫਸਲ ਸਿਹਤ ਡੈਸ਼ਬੋਰਡ ਤਿਆਰ ਹੈ।", tamil: "உங்கள் பயிர் நலம் டாஷ்போர்டு தயாராக உள்ளது.", telugu: "మీ పంట ఆరోగ్య డాష్‌బోర్డ్ సిద్ధంగా ఉంది.", kannada: "ನಿಮ್ಮ ಬೆಳೆ ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸಿದ್ಧವಾಗಿದೆ.", gujarati: "તમારું પાક આરોગ્ય ડેશબોર્ડ તૈયાર છે." },

  // --- Dashboard ---
  "Total Diagnoses": { english: "Total Diagnoses", hindi: "कुल निदान", marathi: "एकूण निदान", punjabi: "ਕੁੱਲ ਨਿਦਾਨ", tamil: "மொத்த நோயறிதல்", telugu: "మొత్తం నిర్ధారణలు", kannada: "ಒಟ್ಟು ರೋಗನಿರ್ಣಯ", gujarati: "કુલ નિદાન" },
  "uploaded": { english: "uploaded", hindi: "अपलोड किया", marathi: "अपलोड केले", punjabi: "ਅੱਪਲੋਡ ਕੀਤਾ", tamil: "பதிவேற்றம்", telugu: "అప్‌లోడ్", kannada: "ಅಪ್ಲೋಡ್", gujarati: "અપલોડ" },
  "Unique Diseases": { english: "Unique Diseases", hindi: "अद्वितीय रोग", marathi: "वेगवेगळे रोग", punjabi: "ਵਿਲੱਖਣ ਬਿਮਾਰੀਆਂ", tamil: "தனிப்பட்ட நோய்கள்", telugu: "ప్రత్యేక వ్యాధులు", kannada: "ವಿಶಿಷ್ಟ ರೋಗಗಳು", gujarati: "અનન્ય રોગો" },
  "identified": { english: "identified", hindi: "पहचाना गया", marathi: "ओळखले", punjabi: "ਪਛਾਨੇ ਗਏ", tamil: "கண்டறியப்பட்டது", telugu: "గుర్తించబడింది", kannada: "ಗುರುತಿಸಲಾಗಿದೆ", gujarati: "ઓળખાયેલ" },
  "Follow-ups": { english: "Follow-ups", hindi: "फॉलो-अप", marathi: "फॉलो-अप", punjabi: "ਫਾਲੋ-ਅੱਪ", tamil: "பின்தொடர்தல்கள்", telugu: "ఫాలో-అప్‌లు", kannada: "ಫಾಲೋ-ಅಪ್‌ಗಳು", gujarati: "ફોલો-અપ" },
  "completed": { english: "completed", hindi: "पूरा किया", marathi: "पूर्ण", punjabi: "ਪੂਰਾ ਕੀਤਾ", tamil: "முடிந்தது", telugu: "పూర్తయింది", kannada: "ಪೂರ್ಣ", gujarati: "પૂર્ણ" },
  "Estimated Loan": { english: "Estimated Loan", hindi: "अनुमानित ऋण", marathi: "अंदाजित कर्ज", punjabi: "ਅੰਦਾਜ਼ਾ ਕਰਜ਼ਾ", tamil: "மதிப்பிட்ட கடன்", telugu: "అంచనా రుణం", kannada: "ಅಂದಾಜು ಸಾಲ", gujarati: "અંદાજિત લોન" },
  "Eligibility": { english: "Eligibility", hindi: "पात्रता", marathi: "पात्रता", punjabi: "ਯੋਗਤਾ", tamil: "தகுதி", telugu: "అర్హత", kannada: "ಅರ್ಹತೆ", gujarati: "પાત્રતા" },
  "Recent crop checks": { english: "Recent crop checks", hindi: "हालिया फसल जांच", marathi: "अलीकडील पीक तपासणी", punjabi: "ਤਾਜ਼ਾ ਫਸਲ ਜਾਂਚ", tamil: "சமீபத்திய பயிர் பரிசோதனை", telugu: "ఇటీవలి పంట తనిఖీలు", kannada: "ಇತ್ತೀಚಿನ ಬೆಳೆ ಪರೀಕ್ಷೆ", gujarati: "તાજેતરની પાક તપાસ" },
  "View all": { english: "View all", hindi: "सभी देखें", marathi: "सर्व पहा", punjabi: "ਸਭ ਦੇਖੋ", tamil: "அனைத்தும் பார்", telugu: "అన్నీ చూడండి", kannada: "ಎಲ್ಲಾ ನೋಡಿ", gujarati: "બધું જુઓ" },
  "Treatment Plan": { english: "Treatment Plan", hindi: "उपचार योजना", marathi: "उपचार योजना", punjabi: "ਇਲਾਜ ਯੋਜਨਾ", tamil: "சிகிச்சை திட்டம்", telugu: "చికిత్స ప్రణాళిక", kannada: "ಚಿಕಿತ್ಸಾ ಯೋಜನೆ", gujarati: "સારવાર યોજના" },
  "Diagnose now": { english: "Diagnose now", hindi: "अभी निदान करें", marathi: "आत्ता निदान करा", punjabi: "ਹੁਣੇ ਨਿਦਾਨ ਕਰੋ", tamil: "இப்போது நோயறிதல்", telugu: "ఇప్పుడు నిర్ధారించండి", kannada: "ಈಗ ರೋಗನಿರ್ಣಯ", gujarati: "હમણાં નિદાન કરો" },
  "No issues detected": { english: "No issues detected", hindi: "कोई समस्या नहीं मिली", marathi: "कोणतीही समस्या आढळली नाही", punjabi: "ਕੋਈ ਸਮੱਸਿਆ ਨਹੀਂ ਮਿਲੀ", tamil: "எந்த பிரச்சினையும் இல்லை", telugu: "ఎటువంటి సమస్యలు లేవు", kannada: "ಯಾವುದೇ ಸಮಸ್ಯೆ ಕಂಡುಬಂದಿಲ್ಲ", gujarati: "કોઈ સમસ્યા મળી નથી" },
  "Severity": { english: "Severity", hindi: "गंभीरता", marathi: "तीव्रता", punjabi: "ਗੰਭੀਰਤਾ", tamil: "தீவிரம்", telugu: "తీవ్రత", kannada: "ತೀವ್ರತೆ", gujarati: "ગંભીરતા" },
  "View full breakdown": { english: "View full breakdown", hindi: "पूरा विवरण देखें", marathi: "संपूर्ण तपशील पहा", punjabi: "ਪੂਰਾ ਵੇਰਵਾ ਦੇਖੋ", tamil: "முழு விவரம் பார்", telugu: "పూర్తి వివరాలు చూడండి", kannada: "ಸಂಪೂರ್ಣ ವಿವರ ನೋಡಿ", gujarati: "સંપૂર્ણ વિગતો જુઓ" },

  // --- Diagnose Crop ---
  "Select your crop type": { english: "Select your crop type", hindi: "अपनी फसल का प्रकार चुनें", marathi: "तुमच्या पिकाचा प्रकार निवडा", punjabi: "ਆਪਣੀ ਫਸਲ ਦੀ ਕਿਸਮ ਚੁਣੋ", tamil: "உங்கள் பயிர் வகையை தேர்வு செய்யவும்", telugu: "మీ పంట రకాన్ని ఎంచుకోండి", kannada: "ನಿಮ್ಮ ಬೆಳೆ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ", gujarati: "તમારા પાકનો પ્રકાર પસંદ કરો" },
  "Upload a photo of the affected leaf or fruit": { english: "Upload a photo of the affected leaf or fruit", hindi: "प्रभावित पत्ती या फल की तस्वीर अपलोड करें", marathi: "प्रभावित पान किंवा फळाचा फोटो अपलोड करा", punjabi: "ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਜਾਂ ਫਲ ਦੀ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ", tamil: "பாதிக்கப்பட்ட இலை அல்லது பழத்தின் புகைப்படம் பதிவேற்றவும்", telugu: "ప్రభావిత ఆకు లేదా పండు ఫోటో అప్‌లోడ్ చేయండి", kannada: "ಪ್ರಭಾವಿತ ಎಲೆ ಅಥವಾ ಹಣ್ಣಿನ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ", gujarati: "અસરગ્રસ્ત પાન અથવા ફળનો ફોટો અપલોડ કરો" },
  "Analyzing your crop...": { english: "Analyzing your crop...", hindi: "आपकी फसल का विश्लेषण हो रहा है...", marathi: "तुमच्या पिकाचे विश्लेषण होत आहे...", punjabi: "ਤੁਹਾਡੀ ਫਸਲ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...", tamil: "உங்கள் பயிர் பகுப்பாய்வு...", telugu: "మీ పంట విశ్లేషణ జరుగుతోంది...", kannada: "ನಿಮ್ಮ ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ...", gujarati: "તમારા પાકનું વિશ્લેષણ..." },
  "Diagnosis complete — score updated!": { english: "Diagnosis complete — score updated!", hindi: "निदान पूर्ण — स्कोर अपडेट!", marathi: "निदान पूर्ण — स्कोर अपडेट!", punjabi: "ਨਿਦਾਨ ਪੂਰਾ — ਸਕੋਰ ਅੱਪਡੇਟ!", tamil: "நோயறிதல் முடிந்தது — மதிப்பெண் புதுப்பிக்கப்பட்டது!", telugu: "నిర్ధారణ పూర్తయింది — స్కోర్ అప్‌డేట్!", kannada: "ರೋಗನಿರ್ಣಯ ಪೂರ್ಣ — ಸ್ಕೋರ್ ನವೀಕರಣ!", gujarati: "નિદાન પૂર્ણ — સ્કોર અપડેટ!" },
  "Recommended Actions": { english: "Recommended Actions", hindi: "अनुशंसित कार्रवाई", marathi: "शिफारस केलेल्या कृती", punjabi: "ਸਿਫਾਰਸ਼ੀ ਕਾਰਵਾਈ", tamil: "பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்", telugu: "సిఫార్సు చర్యలు", kannada: "ಶಿಫಾರಸು ಕ್ರಮಗಳು", gujarati: "ભલામણ કરેલ ક્રિયાઓ" },
  "Diagnose Another Crop": { english: "Diagnose Another Crop", hindi: "एक और फसल निदान करें", marathi: "आणखी एक पीक निदान करा", punjabi: "ਇੱਕ ਹੋਰ ਫਸਲ ਨਿਦਾਨ ਕਰੋ", tamil: "மற்றொரு பயிர் நோயறிதல்", telugu: "మరో పంట నిర్ధారణ", kannada: "ಮತ್ತೊಂದು ಬೆಳೆ ರೋಗನಿರ್ಣಯ", gujarati: "બીજા પાકનું નિદાન" },
  "confident": { english: "confident", hindi: "विश्वसनीय", marathi: "विश्वासार्ह", punjabi: "ਭਰੋਸੇਮੰਦ", tamil: "நம்பகமான", telugu: "నమ్మకమైన", kannada: "ವಿಶ್ವಾಸಾರ್ಹ", gujarati: "વિશ્વસનીય" },

  // --- Score ---
  "Your Agri-Trust Score": { english: "Your Agri-Trust Score", hindi: "आपका कृषि-ट्रस्ट स्कोर", marathi: "तुमचा कृषी-ट्रस्ट स्कोर", punjabi: "ਤੁਹਾਡਾ ਖੇਤੀ-ਟ੍ਰਸਟ ਸਕੋਰ", tamil: "உங்கள் வேளாண் நம்பிக்கை மதிப்பெண்", telugu: "మీ వ్యవసాయ-నమ్మకం స్కోర్", kannada: "ನಿಮ್ಮ ಕೃಷಿ-ಟ್ರಸ್ಟ್ ಸ್ಕೋರ್", gujarati: "તમારો કૃષિ-ટ્રસ્ટ સ્કોર" },
  "Score Breakdown": { english: "Score Breakdown", hindi: "स्कोर विवरण", marathi: "स्कोर तपशील", punjabi: "ਸਕੋਰ ਵੇਰਵਾ", tamil: "மதிப்பெண் பிரிவு", telugu: "స్కోర్ విభజన", kannada: "ಸ್ಕೋರ್ ವಿಭಜನೆ", gujarati: "સ્કોર વિભાજન" },
  "Diagnosis Frequency": { english: "Diagnosis Frequency", hindi: "निदान आवृत्ति", marathi: "निदान वारंवारता", punjabi: "ਨਿਦਾਨ ਆਵਿਰਤੀ", tamil: "நோயறிதல் அதிர்வெண்", telugu: "నిర్ధారణ ఫ్రీక్వెన్సీ", kannada: "ರೋಗನಿರ್ಣಯ ಆವರ್ತನ", gujarati: "નિદાન આવૃત્તિ" },
  "Crop Improvement": { english: "Crop Improvement", hindi: "फसल सुधार", marathi: "पीक सुधारणा", punjabi: "ਫਸਲ ਸੁਧਾਰ", tamil: "பயிர் மேம்பாடு", telugu: "పంట మెరుగుదల", kannada: "ಬೆಳೆ ಸುಧಾರಣೆ", gujarati: "પાક સુધારણા" },
  "Location Consistency": { english: "Location Consistency", hindi: "स्थान निरंतरता", marathi: "स्थान सातत्य", punjabi: "ਸਥਾਨ ਇਕਸਾਰਤਾ", tamil: "இடம் நிலைத்தன்மை", telugu: "స్థాన స్థిరత్వం", kannada: "ಸ್ಥಳ ಸ್ಥಿರತೆ", gujarati: "સ્થાન સુસંગતતા" },
  "Seasonal Management": { english: "Seasonal Management", hindi: "मौसमी प्रबंधन", marathi: "हंगामी व्यवस्थापन", punjabi: "ਮੌਸਮੀ ਪ੍ਰਬੰਧਨ", tamil: "பருவகால மேலாண்மை", telugu: "సీజనల్ మేనేజ్‌మెంట్", kannada: "ಋತುಕಾಲ ನಿರ್ವಹಣೆ", gujarati: "મોસમી વ્યવસ્થાપન" },
  "Response Time": { english: "Response Time", hindi: "प्रतिक्रिया समय", marathi: "प्रतिसाद वेळ", punjabi: "ਜਵਾਬ ਸਮਾਂ", tamil: "பதில் நேரம்", telugu: "ప్రతిస్పందన సమయం", kannada: "ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ", gujarati: "પ્રતિસાદ સમય" },

  // --- History ---
  "Your Crop Journal": { english: "Your Crop Journal", hindi: "आपकी फसल डायरी", marathi: "तुमची पीक डायरी", punjabi: "ਤੁਹਾਡੀ ਫਸਲ ਡਾਇਰੀ", tamil: "உங்கள் பயிர் நாட்குறிப்பு", telugu: "మీ పంట జర్నల్", kannada: "ನಿಮ್ಮ ಬೆಳೆ ಜರ್ನಲ್", gujarati: "તમારી પાક ડાયરી" },
  "diagnoses recorded": { english: "diagnoses recorded", hindi: "निदान दर्ज", marathi: "निदान नोंदवले", punjabi: "ਨਿਦਾਨ ਦਰਜ", tamil: "நோயறிதல் பதிவு", telugu: "నిర్ధారణలు నమోదు", kannada: "ರೋಗನಿರ್ಣಯ ದಾಖಲು", gujarati: "નિદાન નોંધાયા" },
  "Search disease or crop...": { english: "Search disease or crop...", hindi: "रोग या फसल खोजें...", marathi: "रोग किंवा पीक शोधा...", punjabi: "ਬਿਮਾਰੀ ਜਾਂ ਫਸਲ ਖੋਜੋ...", tamil: "நோய் அல்லது பயிர் தேடுங்கள்...", telugu: "వ్యాధి లేదా పంట వెతకండి...", kannada: "ರೋಗ ಅಥವಾ ಬೆಳೆ ಹುಡುಕಿ...", gujarati: "રોગ અથવા પાક શોધો..." },
  "View full diagnosis": { english: "View full diagnosis", hindi: "पूरा निदान देखें", marathi: "संपूर्ण निदान पहा", punjabi: "ਪੂਰਾ ਨਿਦਾਨ ਦੇਖੋ", tamil: "முழு நோயறிதல் பார்", telugu: "పూర్తి నిర్ధారణ చూడండి", kannada: "ಸಂಪೂರ್ಣ ರೋಗನಿರ್ಣಯ ನೋಡಿ", gujarati: "સંપૂર્ણ નિદાન જુઓ" },

  // --- Settings ---
  "Manage your profile and preferences": { english: "Manage your profile and preferences", hindi: "अपनी प्रोफ़ाइल और प्राथमिकताएं प्रबंधित करें", marathi: "तुमची प्रोफाइल आणि प्राधान्ये व्यवस्थापित करा", punjabi: "ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਤਰਜੀਹਾਂ ਪ੍ਰਬੰਧਿਤ ਕਰੋ", tamil: "உங்கள் சுயவிவரம் மற்றும் விருப்பங்களை நிர்வகிக்கவும்", telugu: "మీ ప్రొఫైల్ మరియు ప్రాధాన్యతలు నిర్వహించండి", kannada: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ", gujarati: "તમારી પ્રોફાઇલ અને પસંદગીઓ સંચાલિત કરો" },
  "Language Preference": { english: "Language Preference", hindi: "भाषा प्राथमिकता", marathi: "भाषा प्राधान्य", punjabi: "ਭਾਸ਼ਾ ਤਰਜੀਹ", tamil: "மொழி விருப்பம்", telugu: "భాషా ప్రాధాన్యత", kannada: "ಭಾಷಾ ಆದ್ಯತೆ", gujarati: "ભાષા પસંદગી" },
  "Save Changes": { english: "Save Changes", hindi: "बदलाव सहेजें", marathi: "बदल जतन करा", punjabi: "ਬਦਲਾਅ ਸੇਵ ਕਰੋ", tamil: "மாற்றங்களை சேமி", telugu: "మార్పులు సేవ్ చేయండి", kannada: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ", gujarati: "ફેરફારો સાચવો" },
  "Profile": { english: "Profile", hindi: "प्रोफ़ाइल", marathi: "प्रोफाइल", punjabi: "ਪ੍ਰੋਫਾਈਲ", tamil: "சுயவிவரம்", telugu: "ప్రొఫైల్", kannada: "ಪ್ರೊಫೈಲ್", gujarati: "પ્રોફાઇલ" },

  // --- Common ---
  "Weather N/A": { english: "Weather N/A", hindi: "मौसम उपलब्ध नहीं", marathi: "हवामान उपलब्ध नाही", punjabi: "ਮੌਸਮ ਉਪਲਬਧ ਨਹੀਂ", tamil: "வானிலை கிடைக்கவில்லை", telugu: "వాతావరణం అందుబాటులో లేదు", kannada: "ಹವಾಮಾನ ಲಭ್ಯವಿಲ್ಲ", gujarati: "હવામાન ઉપલબ્ધ નથી" },
  "Back to My Log": { english: "Back to My Log", hindi: "मेरे लॉग पर वापस", marathi: "माझ्या लॉगवर परत", punjabi: "ਮੇਰੇ ਲੌਗ ਤੇ ਵਾਪਸ", tamil: "எனது பதிவுக்கு திரும்பு", telugu: "నా లాగ్‌కు తిరిగి", kannada: "ನನ್ನ ಲಾಗ್‌ಗೆ ಹಿಂತಿರುಗಿ", gujarati: "મારા લોગ પર પાછા" },
  "Weather at Diagnosis": { english: "Weather at Diagnosis", hindi: "निदान के समय मौसम", marathi: "निदानाच्या वेळचे हवामान", punjabi: "ਨਿਦਾਨ ਸਮੇਂ ਮੌਸਮ", tamil: "நோயறிதல் நேரத்தில் வானிலை", telugu: "నిర్ధారణ సమయంలో వాతావరణం", kannada: "ರೋಗನಿರ್ಣಯ ಸಮಯದಲ್ಲಿ ಹವಾಮಾನ", gujarati: "નિદાન સમયે હવામાન" },
  "Location Details": { english: "Location Details", hindi: "स्थान विवरण", marathi: "स्थान तपशील", punjabi: "ਸਥਾਨ ਵੇਰਵੇ", tamil: "இட விவரங்கள்", telugu: "స్థాన వివరాలు", kannada: "ಸ್ಥಳ ವಿವರಗಳು", gujarati: "સ્થાન વિગતો" },
};

/**
 * Get translation for a key in the specified language.
 * Falls back to English if not found.
 */
export function t(key: string, lang: Language = "english"): string {
  const entry = translations[key];
  if (!entry) return key; // Return the key itself if not in dictionary
  return entry[lang] || entry.english || key;
}

/**
 * Get language label abbreviation for display
 */
export function getLangLabel(lang: Language): string {
  const labels: Record<Language, string> = {
    english: "EN", hindi: "हि", marathi: "म", punjabi: "ਪੰ",
    tamil: "த", telugu: "తె", kannada: "ಕ", gujarati: "ગુ",
  };
  return labels[lang] || "EN";
}

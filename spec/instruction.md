Create a polished mobile wedding invitation web app for a Korean wedding.

Project goal:
Build a romantic, emotional, bright, pastel-toned, clean, and well-organized mobile invitation page for the wedding of Gu Eunseong and Kim Yeeun. The design should feel elegant, warm, soft, and refined, not flashy. It should be optimized primarily for mobile devices, but still look good on desktop.

Reference assets:

- Use the images inside public/imgs appropriately throughout the page.
- Group unused photos or similar photos into a gallery section.
- Also refer to the images and links inside the references folder for design tone and structure.

Wedding information:

- Groom: 구은성
- Bride: 김예은

Parents:

- Groom is the eldest son of 구지홍 and 황미선
- Bride is the daughter of 김광일 and 최경림

Date and time:

- 2026년 6월 6일 토요일 낮 12시
- Also display this date visually in a calendar-style section

Venue:

- 꽃재교회 2층 대예배실
- Address: 기독교대한감리회 꽃재교회 2층 대예배실, 마장로 164(1070-5)

Invitation message (Korean):
초대합니다

서로 다른 나라에서 살아온 두 사람이
사랑이라는 가장 큰 선물로 하나가 되었습니다.
이제 소중한 분들 앞에서 평생 서로에게 가장 귀한 선물이 되겠다고 약속하려 합니다.
두 사람이 한 가정을 이루는 이 순간에 함께하시어 축복해주시면 감사하겠습니다.

Invitation message (English):
Two people from two different lands have received the greatest gift.
Now they promise to be each other's gift forever.
We invite those we love to bless us as we unite our hearts as one.

You have to make a Korean and English version with language toggle button.

Map / directions:

- Include a location section with clean map-style UI
- Show buttons for:
  - Naver Map
  - Kakao Map
  - Copy address
- Use these links:
  - Naver Map: https://naver.me/FvEgIqLh
  - Kakao Map: https://place.map.kakao.com/23465934
- The page should visually show the venue location section even if an actual embedded Naver map is not possible

RSVP feature:

- Include an RSVP form
- Save RSVP submissions into Google Sheets
- Spreadsheet URL:
  https://docs.google.com/spreadsheets/d/13eUxD17piHgFJ2D8wu2Ba287qmwxH7iUaRVqQaTleDg/edit?gid=0#gid=0
- Make the form fields:
  - name
  - phone number
  - groom side / bride side
  - attendance status (attending / not attending)
  - number of attendees
  - meal attendance
  - optional message
- Structure the code so that Google Sheets integration can be connected via Google Apps Script webhook endpoint
- Add a clear placeholder for the webhook URL in environment variables or config

Guest photo upload feature:

- Add a section where wedding guests can upload photos they took at the wedding
- Use a real storage-ready architecture
- Abstract the upload logic so it can be connected easily to Supabase Storage, Firebase Storage, or S3
- Include clear placeholder configuration for storage provider and upload endpoint
- Add upload UI with:
  - multiple image upload
  - upload progress
  - thumbnail preview
  - success/error feedback
- Make it easy to switch to admin approval flow later

Gallery:

- Use photos from public/imgs throughout the page
- Create a separate gallery section using remaining photos or visually similar photos
- Use a clean masonry or elegant stacked card style
- Add lightbox view on tap
- Optimize images for mobile performance

Page structure suggestion:

1. Hero section with the main photo and couple names
2. Invitation text section
3. Wedding information section
4. Calendar / date highlight section
5. Venue / map / directions section
6. RSVP section
7. Gallery section
8. Guest photo upload section
9. Footer section

Design requirements:

- Bright pastel color palette
- Romantic and emotional feeling
- Minimal, neat, premium layout
- Soft spacing and typography
- Smooth, subtle scroll animations only
- Avoid clutter and excessive decorative elements
- Make the page feel like a premium mobile wedding invitation

Technical requirements:

- Use a modern React-based stack (prefer Next.js if suitable)
- Mobile-first responsive design
- Clean component structure
- Reusable sections/components
- Easy deployment to Vercel
- Use environment variables for external integrations
- Add comments where setup is required for Google Sheets webhook and storage service
- Keep code production-friendly and readable

Extra recommended features:

- D-day countdown
- Copy link button
- Kakao share button placeholder
- “Add to calendar” button
- Address copy button
- Smooth reveal animations
- SEO/Open Graph metadata for sharing

Deliverables:

- Full implementation code
- Clear project structure
- Setup instructions for Google Sheets integration
- Setup instructions for photo upload storage
- Sample environment variable file
- Clean README

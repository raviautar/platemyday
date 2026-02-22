# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - link "About" [ref=e6] [cursor=pointer]:
          - /url: /about
        - link "Sign In" [ref=e7] [cursor=pointer]:
          - /url: /login
          - img [ref=e8]
      - generic [ref=e17]:
        - paragraph [ref=e18]: Your personalized meal planner
        - img "PlateMyDay Logo" [ref=e20]
        - heading "PlateMyDay" [level=1] [ref=e21]
        - link "by ravilution.ai Ravilution" [ref=e23] [cursor=pointer]:
          - /url: https://ravilution.ai
          - text: by
          - img "ravilution.ai" [ref=e24]
          - generic [ref=e25]: Ravilution
        - button "Let's Plan!" [ref=e26]:
          - img [ref=e27]
          - text: Let's Plan!
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]:
    - img [ref=e36]
  - alert [ref=e39]
```
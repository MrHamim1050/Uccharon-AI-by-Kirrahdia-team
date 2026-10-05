# Remix of Uchcharon AI by HB

Create a voice input component with a large microphone button. When clicked, it requests microphone access, starts recording with a live waveform animation, and shows a recording timer. On stop, it sends the audio to the Speech-to-Text AI connector and displays the transcribed text in a textarea. Add a 'Submit for Pronunciation Check' button that compares the transcribed text to the target sentence and highlights mismatched words in red

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://uccharon-ai-by-kirrahdia.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3c764451-3982-4471-88c1-9a1de728b45b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

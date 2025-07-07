import { DemoStorage, storage, PhotoBook, PageFormat } from "./storage.ts";
import express from 'express';
import cors from 'cors';

const app = express()
const port = 3000

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})

app.use(express.json())

type UploadInput = {
  file: File;
  fileType: string;
  fileSize: number;
};

type PageInput = {
  page: number;
  arrangement: PageArrangementInput;
};

type PhotoBookInput = {
    title: string;
    pageFormat: PageFormatInput;
    pageCount: number;
}

enum PageArrangementInput {
    GRID,
    COLLAGE,
    SINGLE,
    DOUBLE,
    TRIPLE,
    QUAD,
    PANORAMA,
    FULL_PAGE,
    SPLIT, 
};

enum PageFormatInput {
  A4 = "A4",
  A5 = "A5",
  A6 = "A6",
};

function createPhotoBook(input: PhotoBookInput): string {
    const newBook = new PhotoBook(
        input.title,
        PageFormat.A5,
        input.pageCount
    )

  return storage.createPhotoBook(
    newBook
  );
};

function addPage(input: PageInput): void {
  console.log("Adding page number:", input.page);
};

function upload(uploadInput: UploadInput): void {
  console.log("Uploading file:", uploadInput.file);
  console.log("File type:", uploadInput.fileType);
  console.log("File size:", uploadInput.fileSize);
}

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/upload', (req, res) => {
    console.log("Upload endpoint hit", req);
    const photobookId = req.query.key;
    const file = req.body;
    console.log("File received:", file.img);
});

app.post('/create', (req, res) => {
    const input: PhotoBookInput = {
        title: "My Photo Book",
        pageFormat: PageFormatInput.A4,
        pageCount: 10
    };
    let newKey = createPhotoBook(input);
    console.log("Created new photo book with key:", newKey);
    res.send(JSON.stringify({
      key: newKey,
    }));
});

app.get('/photobook', (req, res) => {
    const photobookId = req.query.key;
    res.send(
      JSON.stringify(
        storage.getPhotoBook(photobookId)
      )
    )
});

app.get('/add_page', (req, res) => {
    res.send('Hello World! upload')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


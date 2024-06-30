const Document = require('../Models/document');
const {upload, initializeStorage} = require('../Config/multer');

const uploadFile = async file => {
  if (!file) {
    throw new Error('File is undefined');
  }
  const bucket = await initializeStorage();
  const originalname = file.originalname;
  const blob = bucket.file(`${Date.now()}-${originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    gzip: true,
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', err => {
      reject(err);
    });

    blobStream.on('finish', async () => {
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

exports.list = async (req, res) => {
  try {
    const documents = await Document.find();
    res.render('document', {
      userLoggedIn: !!req.session.user,
      user: req.session.user,
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.read = async (req, res) => {
  try {
    const category = req.params.category;
    const documents = await Document.find({category});
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.display_edit_page = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({error: 'Document not found'});
    }
    res.render('edit-document', {
      document,
      userLoggedIn: !!req.session.user,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.create = async (req, res) => {
  try {
    const {
      category,
      title,
      adminName,
      numberID,
      organization,
      role,
      attachmentType,
    } = req.body;

    let fileUrl = null;
    let imageUrl = null;

    if (attachmentType === 'file' && req.files && req.files['attachment']) {
      fileUrl = await uploadFile(req.files['attachment'][0]);
    } else if (attachmentType === 'link') {
      fileUrl = req.body.attachment;
    }

    if (req.files && req.files['image']) {
      imageUrl = await uploadFile(req.files['image'][0]);
    }

    const document = new Document({
      category,
      title,
      file: attachmentType === 'file' ? fileUrl : null,
      link: attachmentType === 'link' ? fileUrl : null,
      adminName,
      numberID,
      organization,
      role,
      image: imageUrl,
    });

    await document.save();
    res.status(201).redirect('/document');
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.display_add_page = async (req, res) => {
  try {
    res.render('add-document', {
      userLoggedIn: !!req.session.user,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      category,
      title,
      adminName,
      numberID,
      organization,
      role,
      attachmentType,
    } = req.body;

    let fileUrl = null;
    let imageUrl = null;

    if (attachmentType === 'file' && req.files && req.files['attachment']) {
      fileUrl = await uploadFile(req.files['attachment'][0]);
    } else if (attachmentType === 'link') {
      fileUrl = req.body.attachment;
    }

    if (req.files && req.files['image']) {
      imageUrl = await uploadFile(req.files['image'][0]);
    }

    const updateData = {
      category,
      title,
      file: attachmentType === 'file' ? fileUrl : null,
      link: attachmentType === 'link' ? fileUrl : null,
      adminName,
      numberID,
      organization,
      role,
      image: imageUrl,
    };

    const updatedDocument = await Document.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedDocument) {
      return res.status(404).json({error: 'Document not found'});
    }

    res.status(200).redirect('/document');
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

exports.remove = async (req, res) => {
  const {id} = req.params;

  try {
    await Document.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting Document:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
};

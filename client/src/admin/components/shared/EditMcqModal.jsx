import React, { useState, useEffect } from 'react';
import { Modal, Box, Button } from '@mui/material';
import { Form, Row, Col, Container } from 'react-bootstrap';
import { bioTopicsNames, chemistryTopicsNames, physicsTopicsNames } from '../../../utils/topics';
import { bioChapterNames, englishChapterNames, chemistryChapterNames, physicsChapterNames, logicChapterNames } from '../../../utils/chaptername';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import axiosInstance from '../../../baseUrl';
import { closeSnackbar, useSnackbar } from 'notistack';
import { Close } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
  maxWidth: '1200px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  maxHeight: { xs: '95vh', sm: '90vh' },
  overflowY: 'auto',
  borderRadius: '8px'
};

export default function EditMcqModal({ open, onClose, mcqId, mcqData, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const [errors, setErrors] = useState({});
  const [chap, setChap] = useState(englishChapterNames);
  const [subj, setSubj] = useState('english');
  const [topic, setTopic] = useState([]);
  const [selectChapter, setSelectChapter] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [questionImage, setQuestionImage] = useState(null);
  const [questionImageUrl, setQuestionImageUrl] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);

  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: '',
    difficulty: 'easy',
    category: 'normal',
    subj: 'english',
    chap: '',
    topic: '',
    course: 'nums',
    info: '',
    explain: '',
    imageUrl: '',
    questionImg: ''
  });

  const showCenteredSnackbar = (message, variant) => {
    enqueueSnackbar(message, {
      variant: variant,
      autoHideDuration: 2200,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      action: (
        <Button size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar()}>
          <Close fontSize="small" />
        </Button>
      )
    });
  };

  useEffect(() => {
    if (mcqData) {
      setSubj(mcqData.subject || 'english');
      setImageUrl(mcqData.imageUrl || '');
      setQuestionImageUrl(mcqData.questionImg || '');
      setFormData({
        question: mcqData.question || '',
        options: mcqData.options || ['', '', '', ''],
        correctOption: mcqData.correctOption || '',
        difficulty: mcqData.difficulty || 'easy',
        category: mcqData.category || 'normal',
        subj: mcqData.subject || 'english',
        chap: mcqData.chapter || '',
        topic: mcqData.topic || '',
        course: mcqData.course || 'nums',
        info: mcqData.info || '',
        explain: mcqData.explain || '',
        imageUrl: mcqData.imageUrl || '',
        questionImg: mcqData.questionImg || ''
      });
      setSelectChapter(mcqData.chapter || '');
    }
  }, [mcqData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const index = parseInt(name.slice(-1)) - 1;
      const updatedOptions = [...formData.options];
      updatedOptions[index] = value;
      setFormData({ ...formData, options: updatedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.question.trim()) {
      errors.question = 'Question is required';
    }
    if (formData.options.some(option => !option.trim())) {
      errors.options = 'All options are required';
    }
    if (!formData.correctOption) {
      errors.correctOption = 'Correct Option is required';
    }
    if (!formData.chap.trim()) {
      errors.chap = 'Chapter is required';
    }
    if (subj !== 'logic' && subj !== 'english') {
      if (!formData.topic.trim())
        errors.topic = 'Topic is required';
    }
    if (Object.keys(errors).length === 0) {
      try {
        let finalFormData = { ...formData };

        if (image) {
          const formImgData = new FormData();
          formImgData.append('image', image);
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          };
          const imgResponse = await axiosInstance.post('/upload/img', formImgData, config);
          if (imgResponse.status === 200) {
            finalFormData.imageUrl = imgResponse.data.fileURL;
          } else {
            showCenteredSnackbar('Failed to upload MCQ image', 'error');
            return;
          }
        }

        if (questionImage) {
          const formImgData = new FormData();
          formImgData.append('image', questionImage);
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          };
          const imgResponse = await axiosInstance.post('/upload/img', formImgData, config);
          if (imgResponse.status === 200) {
            finalFormData.questionImg = imgResponse.data.fileURL;
          } else {
            showCenteredSnackbar('Failed to upload question image', 'error');
            return;
          }
        }

        await axiosInstance.put('/mcq/update', { formData: finalFormData, id: mcqId });
        showCenteredSnackbar('MCQ updated successfully', 'success');
        
        setImage(null);
        setImageUrl('');
        setQuestionImage(null);
        setQuestionImageUrl('');
        setErrors({});
        setSelectChapter('');
        setTopic([]);
        
        if (onSuccess) onSuccess();
        onClose();
      } catch (error) {
        showCenteredSnackbar('Failed to update MCQ', 'error');
      }
    } else {
      setErrors(errors);
    }
  };

  useEffect(() => {
    if (subj === 'biology') {
      setChap(bioChapterNames);
      setTopic([]);
    } else if (subj === 'chemistry') {
      setChap(chemistryChapterNames);
      setTopic([]);
    } else if (subj === 'physics') {
      setChap(physicsChapterNames);
      setTopic([]);
    } else if (subj === 'logic') {
      setChap(logicChapterNames);
      setTopic([]);
    } else if (subj === 'english') {
      setChap(englishChapterNames);
      setTopic([]);
    }
  }, [subj]);

  useEffect(() => {
    if (subj === 'biology') {
      const data = bioTopicsNames[selectChapter];
      setTopic(data || []);
    } else if (subj === 'chemistry') {
      const data = chemistryTopicsNames[selectChapter];
      setTopic(data || []);
    } else if (subj === 'physics') {
      const data = physicsTopicsNames[selectChapter];
      setTopic(data || []);
    } else if (subj === 'logic' || subj === 'english') {
      setTopic([]);
    }
    setFormData({ ...formData, topic: '' });
  }, [selectChapter]);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'mcq') {
        setImageUrl(reader.result);
        setImage(file);
      } else if (type === 'question') {
        setQuestionImageUrl(reader.result);
        setQuestionImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const openLightbox = (images) => {
    setLightboxImages(images);
    setLightboxOpen(true);
  };

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    setTopic([]);
    setFormData({ ...formData, [name]: value, topic: '', chap: '' });
    setSubj(e.target.value);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className='p-2 p-md-4'>
          <Container fluid className='px-2 px-md-3'>
            <h1 className="text-primary fw-bold py-2 px-0 px-md-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Edit MCQ Form</h1>
            <Form>
              <Form.Group controlId="question">
                <Form.Label className="fw-bold">Question</Form.Label>
                <Form.Control as="textarea" rows={2} name="question" value={formData.question} onChange={handleChange} isInvalid={!!errors.question} />
                <Form.Control.Feedback type="invalid">{errors.question}</Form.Control.Feedback>
              </Form.Group>

              <div className="card p-3 my-2 border-primary">
                {[1, 2, 3, 4].map((optionNum) => (
                  <Form.Group key={optionNum} controlId={`option${optionNum}`} className='py-1'>
                    <Form.Label>Option {optionNum}</Form.Label>
                    <Form.Control type="text" name={`option${optionNum}`} value={formData.options[optionNum - 1]} onChange={handleChange} isInvalid={!!errors.options} />
                    <Form.Control.Feedback type="invalid">{errors.options}</Form.Control.Feedback>
                  </Form.Group>
                ))}
              </div>

              <Row className='py-2'>
                <Col>
                  <Form.Group controlId="correctOption">
                    <Form.Label className="fw-bold">Correct Option No</Form.Label>
                    <Form.Control type="number" min={1} max={4} name="correctOption" value={formData.correctOption} onChange={handleChange} isInvalid={!!errors.correctOption} />
                    <Form.Control.Feedback type="invalid">{errors.correctOption}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className='py-3'>
                <Col md={2}>
                  <Form.Group controlId="difficulty">
                    <Form.Label>Difficulty</Form.Label>
                    <Form.Control as="select" name="difficulty" value={formData.difficulty} onChange={handleChange}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group controlId="category">
                    <Form.Label>Category</Form.Label>
                    <Form.Control as="select" name="category" value={formData.category} onChange={handleChange}>
                      <option value="normal">Normal</option>
                      <option value="past">Past</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="info">
                    <Form.Label className="fw-bold">MCQ Info</Form.Label>
                    <Form.Control type="text" maxLength={9} name="info" placeholder='For Example Bwp-2021' value={formData.info} onChange={handleChange} isInvalid={!!errors.info} />
                    <Form.Control.Feedback type="invalid">{errors.info}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="subj">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control as="select" name="subj" value={formData.subj} onChange={handleSubjectChange}>
                      <option value="english">English</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="physics">Physics</option>
                      <option value="logic">Logic</option>
                      <option value="biology">Biology</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row className='py-3'>
                <Col md={2}>
                  <Form.Group controlId="course">
                    <Form.Label>Course</Form.Label>
                    <Form.Control as="select" name="course" value={formData.course} onChange={handleChange}>
                      <option value="nums">Nums</option>
                      <option value="mdcat">Mdcat</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group controlId="chap">
                    <Form.Label>Chapter</Form.Label>
                    <Form.Control as="select" placeholder='Select Chapter' name="chap" value={formData.chap} onChange={(e) => { setSelectChapter(e.target.value); handleChange(e); }} isInvalid={!!errors.chap}>
                      <option value={''}>Select Chapter</option>
                      {chap?.map((e, index) => (
                        <option key={index} value={e}>{e}</option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">{errors.chap}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group controlId="topic">
                    <Form.Label>Topic</Form.Label>
                    <Form.Control as="select" required name="topic" value={formData.topic} onChange={handleChange} isInvalid={!!errors.topic}>
                      <option value={''}>Select Topic</option>
                      {topic?.map((e, index) => (
                        <option key={index} value={e}>{e}</option>
                      ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">{errors.topic}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="explain">
                <Form.Label>Explanation</Form.Label>
                <Form.Control as="textarea" rows={5} name="explain" value={formData.explain} onChange={handleChange} />
              </Form.Group>

              <div className="row py-1 my-3">
                <div className="col-md-6 col-12 mb-4">
                  <h6 className="fw-bold text-primary">Explanation Image</h6>
                  <div className="p-1 d-flex gap-2">
                    <div className="row justify-content-center">
                      <input id='mcq-file' type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'mcq')} />
                      <label htmlFor="mcq-file" name="file" className='d-flex justify-content-center'>
                        <span className='btn btn-secondary btn-sm w-100 px-3'>Upload Explanation Image</span>
                      </label>
                    </div>
                    {imageUrl && (
                      <img 
                        height={150} 
                        src={imageUrl} 
                        alt="MCQ Image" 
                        className='border border-primary rounded-2 overflow-hidden cursor-pointer'
                        style={{ cursor: 'pointer' }}
                        onClick={() => openLightbox([{ src: imageUrl }])}
                      />
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-4">
                  <h6 className="fw-bold text-primary">Question Image</h6>
                  <div className="p-1 d-flex gap-2">
                    <div className="row justify-content-center">
                      <input id='question-file' type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'question')} />
                      <label htmlFor="question-file" name="file" className='d-flex justify-content-center'>
                        <span className='btn btn-secondary btn-sm w-100 px-3'>Upload Question Image</span>
                      </label>
                    </div>
                    {questionImageUrl && (
                      <img 
                        height={150} 
                        src={questionImageUrl} 
                        alt="Question Image" 
                        className='border border-primary rounded-2 overflow-hidden cursor-pointer'
                        style={{ cursor: 'pointer' }}
                        onClick={() => openLightbox([{ src: questionImageUrl }])}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12">
                  <Button 
                    className='w-100 fw-bold py-2 bg-warning text-light' 
                    type="submit" 
                    onClick={handleSubmit}
                    sx={{ minHeight: '48px' }}
                  >
                    Update MCQ
                  </Button>
                </div>
              </div>
            </Form>
          </Container>
        </Box>
      </Modal>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages}
      />
    </>
  );
}

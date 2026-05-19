import React, { useEffect, useState } from 'react';
import Subject from '../../components/subject/Subject';

import bio from '../../../assets/subjects/1.png';
import chem from '../../../assets/subjects/2.png';
import phy from '../../../assets/subjects/3.png';
import eng from '../../../assets/subjects/4.png';
import logic from '../../../assets/subjects/5.png';
import mock from '../../../assets/subjects/6.png';
import './subjectpage.scss';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../baseUrl';

// Static map: subject name (lowercase) → display info
const SUBJECT_META = {
  biology:   { displayName: 'BIOLOGY',          img: bio },
  chemistry: { displayName: 'CHEMISTRY',         img: chem },
  physics:   { displayName: 'PHYSICS',           img: phy },
  english:   { displayName: 'ENGLISH',           img: eng },
  logic:     { displayName: 'LOGICAL REASONING', img: logic },
};

const SubjectPage = () => {
  const path = useParams()?.subject;

  const [subjectData, setSubjectData] = useState([]);
  const [user, setUser] = useState(useSelector((state) => state.auth?.user?.user?.user));
  const isMdcat = user?.isMdcat || false;
  const isNums = user?.isNums || false;
  const isMdcatNums = user?.isMdcatNums || false;
  const isTrial = user?.isTrialActive || false;
  const trialStatus = isTrial && !isMdcat && !isNums && !isMdcatNums;

  useEffect(() => {
    if (!path || !['nums', 'mdcat'].includes(path)) return;

    axiosInstance.get(`/course-structure/${path}/subjects`)
      .then(res => {
        const subjects = res.data.map(name => {
          const meta = SUBJECT_META[name.toLowerCase()] || { displayName: name.toUpperCase(), img: bio };
          return {
            name: meta.displayName,
            img: meta.img,
            link: `/dashboard/subject/${path}/${name.toLowerCase()}`,
          };
        });
        // Mock tests are always appended (not part of course structure API)
        subjects.push({
          name: 'MOCK TESTS',
          img: mock,
          link: `/dashboard/subject/${path}/mock/test`,
        });
        setSubjectData(subjects);
      })
      .catch(() => {
        // Fallback: hardcoded defaults if API fails
        const fallback = path === 'nums'
          ? ['biology', 'chemistry', 'physics', 'english']
          : ['biology', 'chemistry', 'physics', 'english', 'logic'];
        const subjects = fallback.map(name => {
          const meta = SUBJECT_META[name];
          return { name: meta.displayName, img: meta.img, link: `/dashboard/subject/${path}/${name}` };
        });
        subjects.push({ name: 'MOCK TESTS', img: mock, link: `/dashboard/subject/${path}/mock/test` });
        setSubjectData(subjects);
      });
  }, [path]);

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-8 col-12 offset-md-2 text-center">
            <h1 className="subjectpage-heading p-3 fw-bold text-white rounded-5 mb-5">SELECT YOUR SUBJECT</h1>
          </div>
        </div>
        <div className="row">
          {subjectData.map((ele, index) => (
            <Subject key={index}  name={ele.name} img={ele.img} isLocked={(trialStatus)?ele.name=='MOCK TESTS':false} link={(trialStatus)?ele.name=='MOCK TESTS'?'#':ele.link:ele.link} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SubjectPage;

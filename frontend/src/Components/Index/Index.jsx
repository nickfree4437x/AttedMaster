import React from 'react';
import Navbar from './Navbar/Navbar';
import Hero from './Hero/Hero';
import About from './About/About';
import Features from './Features/Features';
import HowItWorks from './HowItWorks/HowItWorks';
import Mission from './Mission/Mission';
import WhyChoose from './WhyChoose/WhyChoose';
import Faq from './Faq/Faq';
import Footer from './Footer/Footer';

const Index = () => {
  return (
    <React.Fragment>
      <Navbar />
      <section id='home'>
        <Hero/>
      </section>
      <section id='about'>
        <About/>
      </section>
      <section id='features'>
        <Features/>
      </section>
      <section id='howitworks'>
        <HowItWorks/>
      </section>
      <section id='mission'>
        <Mission/>
      </section>
      <section id='whychoose'>
        <WhyChoose/>
      </section>
      <section id='faq'>
        <Faq/>
      </section>
      <section id='footer'>
        <Footer/>
      </section>
    </React.Fragment>
  );
};

export default Index;

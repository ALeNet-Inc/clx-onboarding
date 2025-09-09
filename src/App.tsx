import React, { useState } from 'react'
import { motion } from 'framer-motion'

const Step = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
    {children}
  </motion.div>
)

export default function App(){
  const [stage, setStage] = useState<'email'|'verify'|'choose'|'form'>('email')
  const [type, setType] = useState<'individual'|'business'|null>(null)

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gradient-to-b from-slate-100 to-slate-200">
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Open an Investment Account</h1>
        <p className="text-slate-600">Secure, guided onboarding for individuals and businesses.</p>
      </header>

      {stage==='email' && (
        <Step>
          <h2 className="text-xl font-medium mb-4">Verify your email</h2>
          <EmailCapture onSent={()=>setStage('verify')} />
        </Step>
      )}

      {stage==='verify' && (
        <Step>
          <h2 className="text-xl font-medium mb-4">Check your inbox</h2>
          <p className="text-slate-600">We sent a link/OTP to verify your email.</p>
          <button className="mt-6 btn" onClick={()=>setStage('choose')}>I verified</button>
        </Step>
      )}

      {stage==='choose' && (
        <Step>
          <h2 className="text-xl font-medium mb-4">Who is opening the account?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Individual" onClick={()=>{setType('individual'); setStage('form')}} />
            <Card title="Business" onClick={()=>{setType('business'); setStage('form')}} />
          </div>
        </Step>
      )}

      {stage==='form' && (
        <Step>
          {type==='individual' ? <IndividualFlow/> : <BusinessFlow/>}
        </Step>
      )}
    </div>
  )
}

function Card({title,onClick}:{title:string;onClick:()=>void}){
  return (
    <button onClick={onClick} className="w-full text-left p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 shadow-sm">
      <div className="text-lg font-medium">{title}</div>
      <div className="text-slate-600">Guided workflow, save & resume.</div>
    </button>
  )
}

function EmailCapture({onSent}:{onSent:()=>void}){
  const [email,setEmail] = React.useState('')
  const [busy,setBusy] = React.useState(false)
  const send = async ()=>{
    setBusy(true)
    await fetch('/api/auth/request-verification',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
    setBusy(false); onSent()
  }
  return (
    <div>
      <label className="block text-sm text-slate-700">Email address</label>
      <input className="mt-1 w-full border rounded-lg p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com"/>
      <button disabled={!email||busy} onClick={send} className="btn mt-3">Send verification</button>
    </div>
  )
}

function Stepper({steps,current}:{steps:string[]; current:number}){
  return (
    <ol className="flex gap-2 mb-6">
      {steps.map((s,i)=> (
        <li key={s} className={`px-3 py-1 rounded-full text-sm ${i<=current? 'bg-slate-900 text-white':'bg-slate-200 text-slate-700'}`}>{i+1}. {s}</li>
      ))}
    </ol>
  )
}

function IndividualFlow(){
  const steps = ['Personal Data','Contact','KYC','Investment','Review']
  const [i,setI] = useState(0)
  return (
    <div>
      <Stepper steps={steps} current={i}/>
      {i===0 && <Section title="Personal Data"><Field label="First name"/><Field label="Last name"/><Field label="Date of Birth" type="date"/><Field label="Nationality"/></Section>}
      {i===1 && <Section title="Contact Information"><Field label="Address"/><Field label="City"/><Field label="State/Region"/><Field label="Postal Code"/><Field label="Phone"/></Section>}
      {i===2 && <Section title="KYC Personal"><Field label="ID Type"/><Field label="ID Number"/><Field label="Tax ID"/></Section>}
      {i===3 && <Section title="Investment Information"><Select label="Objective" options={["Capital Preservation","Income","Balanced","Growth","Aggressive Growth"]}/><Select label="Risk Tolerance" options={["Low","Medium","High"]}/><Field label="Initial Deposit" type="number"/></Section>}
      {i===4 && <Section title="Review & e‑Sign"><p className="text-slate-600">Confirm your details and sign.</p></Section>}
      <NavButtons i={i} setI={setI} n={steps.length}/>
    </div>
  )
}

function BusinessFlow(){
  const steps = ['Company Data','KYC Company','Contacts','Investment','UBOs','Review']
  const [i,setI] = useState(0)
  return (
    <div>
      <Stepper steps={steps} current={i}/>
      {i===0 && <Section title="Company Data"><Field label="Legal Name"/><Field label="Registration Number"/><Field label="Country of Incorporation"/></Section>}
      {i===1 && <Section title="KYC Company"><Field label="Entity Type"/><Field label="Registered Address"/><Field label="Industry"/></Section>}
      {i===2 && <Section title="Company Contacts"><Field label="Contact Name"/><Field label="Email" type="email"/><Field label="Phone"/></Section>}
      {i===3 && <Section title="Investment Information"><Select label="Objective" options={["Capital Preservation","Income","Balanced","Growth","Aggressive Growth"]}/><Select label="Risk Tolerance" options={["Low","Medium","High"]}/></Section>}
      {i===4 && <Section title="Beneficial Owners (UBOs)"><Field label="Owner Name"/><Field label="Ownership %" type="number"/></Section>}
      {i===5 && <Section title="Review & e‑Sign"><p className="text-slate-600">Confirm your details and sign.</p></Section>}
      <NavButtons i={i} setI={setI} n={steps.length}/>
    </div>
  )
}

function Section({title, children}:{title:string;children:React.ReactNode}){
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}
function Field({label,type='text'}:{label:string; type?:string}){
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <input type={type} className="mt-1 w-full border rounded-lg p-2"/>
    </label>
  )
}
function Select({label,options}:{label:string; options:string[]}){
  return (
    <label className="block">
      <span className="text-sm text-slate-700">{label}</span>
      <select className="mt-1 w-full border rounded-lg p-2">{options.map(o=> <option key={o}>{o}</option>)}</select>
    </label>
  )
}
function NavButtons({i,setI,n}:{i:number; setI:(x:number)=>void; n:number}){
  return (
    <div className="mt-6 flex justify-between">
      <button className="btn" disabled={i===0} onClick={()=>setI(i-1)}>Back</button>
      {i < n-1 ? <button className="btn" onClick={()=>setI(i+1)}>Continue</button> : <button className="btn">Submit</button>}
    </div>
  )
}
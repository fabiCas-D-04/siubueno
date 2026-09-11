import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, AlertCircle, User as UserIcon, ShieldCheck, BookOpen, Users, ArrowRight } from 'lucide-react';
import { useAuth, useToast } from '../contexts';
import { Button } from '../components/ui';
import { Captcha, generateCaptcha } from '../components/Captcha';

type Step = 1 | 2 | 3;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<string>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; captcha?: string; password?: string }>({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setError('');
  };

  const handleStep1 = () => {
    setError('');
    const errors: { username?: string; captcha?: string } = {};
    if (!username.trim()) errors.username = 'El usuario es requerido';
    if (!captchaInput.trim()) errors.captcha = 'El captcha es requerido';
    else if (captchaInput.trim().toUpperCase() !== captcha) errors.captcha = 'El captcha no coincide';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(2);
  };

  const handleStep2 = async () => {
    setError('');
    setFieldErrors({});
    if (!password) {
      setFieldErrors({ password: 'La contrasena es requerida' });
      return;
    }

    setIsLoading(true);
    try {
      const { student } = await login(username.trim().toLowerCase(), password);
      setStudentName(student?.first_name || 'Estimado estudiante');
      setPassword('');
      setStep(3);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Usuario o contrasena incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async (role: 'student' | 'administrative') => {
    if (role === 'student') {
      showToast(`Bienvenido, ${studentName}`, 'success');
      navigate('/dashboard', { replace: true });
    } else {
      setError('El perfil de docente no esta habilitado en la version de demostracion.');
      refreshCaptcha();
      setStep(1);
    }
  };

  const goBack = () => {
    setError('');
    setFieldErrors({});
    setStep((s) => (s === 3 ? 2 : s === 2 ? 1 : 1) as Step);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-brand-darker to-brand-dark relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-800 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-white text-sm tracking-wide">UNIVALLE</p>
            <p className="text-[10px] text-blue-300/70 uppercase tracking-widest">SIU · Smart</p>
          </div>
        </div>
        <span className="text-[10px] tracking-widest text-blue-200/60 uppercase hidden sm:block">
          Sistema de Informacion Univalle
        </span>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-800/40 animate-logo-scale-in">
              <GraduationCap className="w-10 h-10 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight animate-letter-space">UNIVALLE</h1>
            <p className="text-xs text-blue-300/70 uppercase tracking-[0.3em] mt-1">Portal Academico</p>
          </div>

          <div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-2xl shadow-2xl p-8 ring-1 ring-white/10 animate-slide-up"
            key={step}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {step === 1 ? 'Iniciar Sesion' : step === 2 ? 'Clave de Acceso' : 'Bienvenido'}
              </h2>
              <div className="flex items-center gap-1" aria-hidden="true">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              {step === 1
                ? 'Ingresa tu usuario y codigo de verificacion'
                : step === 2
                  ? 'Ingresa la contrasena de tu cuenta'
                  : `Mucho gusto, ${studentName}`}
            </p>

            {error && (
              <div
                className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 flex items-start gap-2 text-sm text-red-700 dark:text-red-300 animate-fade-in-down"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label htmlFor="username" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Usuario
                  </label>
                  <div className="flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-700 focus-within:border-blue-600 transition-colors">
                    <UserIcon className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="INGRESA TU USUARIO"
                      autoComplete="username"
                      aria-label="Ingrese su usuario"
                      className="flex-1 bg-transparent py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 uppercase focus:outline-none"
                    />
                  </div>
                  {fieldErrors.username && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.username}</p>}
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Codigo de verificacion
                  </span>
                  <div className="flex items-stretch gap-2">
                    <Captcha text={captcha} onRefresh={refreshCaptcha} />
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="CAPTCHA"
                      autoComplete="off"
                      aria-label="Ingrese el captcha"
                      maxLength={4}
                      className="w-24 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-center text-sm font-semibold tracking-[0.3em] text-gray-900 dark:text-gray-100 placeholder-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {fieldErrors.captcha && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.captcha}</p>}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Usuario de prueba:{' '}
                    <strong className="font-mono text-gray-700 dark:text-gray-300">estudiante</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setError('Contacta a coordinacion academica para recuperar tu usuario.')}
                    className="text-blue-700 dark:text-blue-400 hover:underline focus:outline-none"
                  >
                    ¿Olvidaste tu usuario?
                  </button>
                </div>

                <Button onClick={handleStep1} className="w-full py-2.5 text-base btn-press" size="lg">
                  CONTINUAR <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <form
                className="space-y-5 animate-fade-in"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStep2();
                }}
                noValidate
              >
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Contrasena
                  </label>
                  <div className="flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-700 focus-within:border-blue-600 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="INGRESA TU CONTRASENA"
                      autoComplete="current-password"
                      aria-label="Ingrese su contrasena"
                      className="flex-1 bg-transparent py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                      aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.password}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Contrasena de prueba: <strong className="font-mono text-gray-700 dark:text-gray-300">Estudiante123</strong>
                  </p>
                </div>

                <Button type="submit" isLoading={isLoading} className="w-full py-2.5 text-base btn-press" size="lg">
                  {isLoading ? 'Verificando...' : 'INGRESAR'}
                </Button>

                <div className="flex items-center justify-between">
                  <button type="button" onClick={goBack} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
                    ← Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => setError('Contacta a coordinacion academica para restablecer tu contrasena.')}
                    className="text-xs text-blue-700 dark:text-blue-400 hover:underline focus:outline-none"
                  >
                    ¿Has olvidado tu contrasena?
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Tu sesion fue validada correctamente. Selecciona tu perfil para continuar al portal academico.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFinish('student')}
                    className="group rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-5 text-center hover:border-blue-500 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Ingresar como estudiante"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Estudiante</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Gestion academica</p>
                  </button>

                  <button
                    onClick={() => handleFinish('administrative')}
                    className="group rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-5 text-center hover:border-gray-400 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Ingresar como docente o administrativo"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-500 text-white flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Docente</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Administrativo</p>
                  </button>
                </div>

                <button
                  onClick={goBack}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none py-1"
                >
                  ← Ingresar con otro usuario
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-blue-200/70 mt-5">
            © {new Date().getFullYear()} Universidad del Valle - Sistema de Gestion Academica
          </p>
        </div>
      </main>
    </div>
  );
}
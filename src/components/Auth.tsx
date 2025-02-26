'use client';

import { useState, FormEvent } from 'react';
import { useGame } from '@/contexts/GameContext';
import { FiUser, FiArrowRight, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAnalytics } from '@/hooks/useAnalytics';
import Image from 'next/image';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

type AuthMode = 'login' | 'register';

export function Auth() {
  const { setUser } = useGame();
  const { trackEvent } = useAnalytics();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Criar/atualizar documento do usuário
      await setDoc(doc(db, 'users', result.user.uid), {
        id: result.user.uid,
        nickname: result.user.displayName || 'Jogador',
        email: result.user.email,
        score: 0,
        xp: 0,
        achievements: [],
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        photoURL: result.user.photoURL,
        createdAt: new Date(),
      }, { merge: true });

      const userData = {
        id: result.user.uid,
        nickname: result.user.displayName || 'Jogador',
        email: result.user.email!,
        score: 0,
        xp: 0,
        achievements: [],
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
      };

      setUser(userData);

      // Track login event
      await trackEvent('login', {
        method: 'google',
        userId: result.user.uid
      });

      toast.success('Login realizado com sucesso!');
    } catch (error) {
      const authError = error as FirebaseError;
      toast.error('Erro ao fazer login com Google');
      console.error(authError);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!formData.nickname || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Preencha todos os campos!');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error('As senhas não coincidem!');
          return;
        }

        // Criar usuário no Firebase Auth
        const { user } = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Criar documento do usuário no Firestore
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          nickname: formData.nickname.trim(),
          email: formData.email,
          score: 0,
          xp: 0,
          achievements: [],
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          correctGuesses: 0,
          createdAt: new Date(),
        });

        const userData = {
          id: user.uid,
          nickname: formData.nickname.trim(),
          email: formData.email,
          score: 0,
          xp: 0,
          achievements: [],
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          correctGuesses: 0,
        };

        setUser(userData);

        // Track registration event
        await trackEvent('sign_up', {
          method: 'email',
          userId: user.uid
        });

        toast.success('Conta criada com sucesso!');
      } else {
        if (!formData.email || !formData.password) {
          toast.error('Preencha todos os campos!');
          return;
        }

        // Login com Firebase Auth
        const { user } = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const userData = {
          id: user.uid,
          nickname: user.displayName || 'Jogador',
          email: user.email!,
          score: 0,
          xp: 0,
          achievements: [],
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
        };

        setUser(userData);

        // Track login event
        await trackEvent('login', {
          method: 'email',
          userId: user.uid
        });

        toast.success('Login realizado com sucesso!');
      }
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      const errorMessage = firebaseError.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está em uso'
        : firebaseError.code === 'auth/invalid-email'
        ? 'E-mail inválido'
        : firebaseError.code === 'auth/weak-password'
        ? 'A senha deve ter pelo menos 6 caracteres'
        : firebaseError.code === 'auth/wrong-password'
        ? 'Senha incorreta'
        : firebaseError.code === 'auth/user-not-found'
        ? 'Usuário não encontrado'
        : 'Erro ao realizar operação';
      
      // Track error event
      await trackEvent('auth_error', {
        error_code: firebaseError.code,
        error_message: errorMessage
      });
      
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden"
        >
          {/* Header */}
          <motion.div
            variants={item}
            className="relative p-6 text-center border-b border-gray-800/50"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20" />
            <motion.h2
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text"
            >
              Quem Eu Sou?
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-gray-400"
            >
              {mode === 'login' ? 'Faça login para jogar' : 'Crie sua conta para jogar'}
            </motion.p>
          </motion.div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800/50">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 p-4 text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 p-4 text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Adicionar botão de login com Google antes do form */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 mb-4 rounded-xl text-white font-medium relative overflow-hidden flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Continuar com Google
          </motion.button>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative">
              <span className="px-4 text-sm text-gray-500 bg-gray-900">ou</span>
            </div>
          </div>

          {/* Form */}
          <motion.form
            variants={item}
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-300">
                    Nickname
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                    <div className="relative flex items-center">
                      <div className="absolute left-4">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <FiUser className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-gray-900/70 text-white rounded-xl border-2 border-gray-800/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-500"
                        placeholder="Escolha seu nickname..."
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                <div className="relative flex items-center">
                  <div className="absolute left-4">
                    <FiMail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/70 text-white rounded-xl border-2 border-gray-800/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-500"
                    placeholder="Digite seu e-mail..."
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                <div className="relative flex items-center">
                  <div className="absolute left-4">
                    <FiLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-gray-900/70 text-white rounded-xl border-2 border-gray-800/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-500"
                    placeholder="Digite sua senha..."
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-300">
                    Confirme sua senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
                    <div className="relative flex items-center">
                      <div className="absolute left-4">
                        <FiLock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 bg-gray-900/70 text-white rounded-xl border-2 border-gray-800/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-500"
                        placeholder="Confirme sua senha..."
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl text-white font-medium relative overflow-hidden ${
                isSubmitting ? 'cursor-not-allowed' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{mode === 'login' ? 'Entrando...' : 'Criando conta...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Entrar' : 'Criar conta'}</span>
                    <FiArrowRight className="w-5 h-5" />
                  </>
                )}
              </div>
            </motion.button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {mode === 'login' 
                  ? 'Não tem uma conta? Crie agora!' 
                  : 'Já tem uma conta? Faça login!'}
              </button>
            </div>
          </motion.form>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -100],
                x: Math.random() * 20 - 10
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
} 
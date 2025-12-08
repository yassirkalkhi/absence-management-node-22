import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { activateStudent } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, CheckCircle } from 'lucide-react';

export default function ActivateStudentPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        try {
            const response = await activateStudent({ email, password });
            login(response.user, response.token);
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'activation du compte');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-3 pb-6">
                    <div className="flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-center">Activer mon compte</CardTitle>
                    <CardDescription className="text-center text-base">
                        Créez votre mot de passe pour activer votre compte étudiant
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                Utilisez l'email fourni par votre administrateur lors de votre inscription.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Adresse email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="votre.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Mot de passe
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                                className="h-11"
                                autoComplete="new-password"
                            />
                            <p className="text-xs text-muted-foreground">
                                Au moins 6 caractères
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirmer le mot de passe
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                minLength={6}
                                className="h-11"
                                autoComplete="new-password"
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-6 pt-2">
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Activation en cours...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Activer mon compte
                                </>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Déjà activé ?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                Vous avez déjà un compte ?
                            </p>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-primary hover:underline inline-flex items-center"
                            >
                                Se connecter
                                <span className="ml-1">→</span>
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

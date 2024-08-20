export default function Rules() {
  return (
    <section className="container" id="rules">
      <h4>Le but</h4>
      <p>
        Draw Suspect est un jeu de dessin à rôles cachés qui se joue en tour par
        tour. Chaque joueur incarne un personnage impliqué dans une commande
        d&apos;art. Le but du jeu est de gagner le maximum de points au fil des
        parties.
      </p>
      <h4>Les rôles</h4>
      <p>
        Dans Draw Suspect vous pouvez, aléatoirement, incarner trois rôles de
        personnage :
      </p>
      <div className="roles">
        <div className="role is-green has-text-light-blue">
          <h4>L'acheteur d'art</h4>
          <p>
            Vous avez commandé une œuvre d’art surprise au collectif de
            peintres.{" "}
          </p>
          <p>
            Trouvez le plus rapidement possible le thème du chef d’œuvre qu’ils
            vous préparent.
          </p>
          <p>
            Virer les arnaqueurs du projet avant qu’ils ne saccagent la nouvelle
            pièce maîtresse de votre salon.
          </p>
          <p>
            Vous gagnez des points en fonction du temps que vous mettez à
            trouver le thème
          </p>
        </div>
        <div className="role is-orange has-text-light-blue">
          <h4>Le peintre</h4>
          <p>
            Vous avez été missioné vous et votre équipe pour réaliser un chef
            d’œuvre
          </p>
          <p>
            Choisissez un thème parmis les trois proposés et dessinez-le
            ensemble, trait par trait, pour le faire deviner à l’acheteur.
          </p>
          <p>
            Essayez de masquer au mieux les tentatives des arnaqueurs de
            saccager votre peinture.
          </p>
          <p>
            Vous gagnez des points en fonction du temps que vous mettez à faire
            deviner le thème à l'acheteur
          </p>
        </div>
        <div className="role is-red has-text-light-blue">
          <h4>L'arnaqueur</h4>
          <p>
            Vous avez été missioné par un autre acheteur, jaloux, pour saccager
            le projet.
          </p>
          <p>
            Lorsque c’est à votre tour de dessiner, orientez le dessin vers
            votre thème plutôt que vers celui des peintres.
          </p>
          <p>
            Soyez discret et habile pour ne pas vous faire virer par l’acheteur
          </p>
          <p>
            Vous gagnez des points en fonction du temps que vous faites perdre à
            l'équipe ou si l'acheteur devine votre thème à la place de celui de
            l'équipe principale
          </p>
        </div>
      </div>
      <a href="#home">
        <h4 className="mt-5 mb-5">Jouer !</h4>
      </a>
    </section>
  );
}

class BackfillDataForDhClasses < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Homebrew::Speciality.find_each do |item|
      data = item.data
      ::Daggerheart::Homebrews::Speciality.create(
        id: item.id,
        user_id: item.user_id,
        title: { en: item.name, ru: item.name },
        public: item.public,
        discarded_at: item.discarded_at,
        description: {},
        info: {
          evasion: data.evasion,
          health_max: data.health_max,
          domains: data.domains
        }
      )
    end
  end

  def down; end
end

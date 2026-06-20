class BackfillDataForDhSubclasses < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Homebrew::Subclass.find_each do |item|
      data = item.data
      new_item = ::Daggerheart::Homebrews::Subclass.create(
        id: item.id,
        user_id: item.user_id,
        title: { en: item.name, ru: item.name },
        public: item.public,
        discarded_at: item.discarded_at,
        description: {},
        info: {
          spellcast: data.spellcast,
          mechanics: data.mechanics,
          class_id: item.class_name
        }
      )
    end
  end

  def down; end
end

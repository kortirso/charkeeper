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

      item.homebrew_book_items.update_all(itemable_type: 'Daggerheart::Homebrews::Subclass', itemable_id: new_item.id)
    end
  end

  def down; end
end

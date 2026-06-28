class BackfillDataForDndHomebrewBackgrounds < ActiveRecord::Migration[8.1]
  def up
    Dnd2024::Homebrew::Background.find_each do |item|
      ::Dnd2024::Homebrews::Background.create(
        id: item.id,
        user_id: item.user_id,
        title: item.data.names,
        public: item.public,
        discarded_at: item.discarded_at,
        description: item.data.descriptions,
        info: {
          selected_feats: item.data.selected_feats,
          selected_skills: item.data.selected_skills,
          ability_boosts: item.data.ability_boosts
        }
      )
    end

    Homebrew::Book::Item
      .where(itemable_type: 'Dnd2024::Homebrew::Background')
      .update_all(itemable_type: 'Dnd2024::Homebrews::Background')
  end

  def down; end
end

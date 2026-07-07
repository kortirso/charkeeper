class RemoveOldTables < ActiveRecord::Migration[8.1]
  def up
    safety_assured do
      remove_column :feats, :reverse_refresh
      remove_column :character_bonus, :character_id

      drop_table :daggerheart_character_features
      drop_table :daggerheart_homebrew_domains
      drop_table :daggerheart_homebrew_transformations
      drop_table :dnd2024_character_features
      drop_table :dnd5_character_features
      drop_table :homebrew_communities
      # drop_table :homebrew_races
      drop_table :homebrew_specialities
      # drop_table :homebrew_subclasses

      ::Homebrew::Book::Item.where(itemable_type: ['Daggerheart::Homebrew::Subclass', 'Homebrew::Subclass']).destroy_all

      Daggerheart::Feat.find_by(slug: 'toxic_concoctions')&.update(
        description_eval_variables: {},
        limit_refresh: nil,
        tokens: {
          limit: 'none',
          reset_at: 'long',
          reset: 'zero'
        }
      )

      Daggerheart::Feat.find_by(slug: 'prayer_dice')&.update(
        description_eval_variables: {},
        limit_refresh: nil,
        kind: 'static',
        tokens: {
          limit: 'spellcast',
          reset_at: 'session',
          reset: 'limit'
        }
      )
    end
  end

  def down; end
end

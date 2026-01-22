class AddBonusableToBonuses < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    add_column :character_bonus, :bonusable_id, :uuid unless column_exists?(:character_bonus, :bonusable_id)
    add_column :character_bonus, :bonusable_type, :string unless column_exists?(:character_bonus, :bonusable_type)
    
    unless index_exists?(:character_bonus, [:bonusable_id, :bonusable_type])
      add_index :character_bonus, [:bonusable_id, :bonusable_type], algorithm: :concurrently
    end

    # Character::Bonus.find_each do |bonus|
    #   bonus.update(bonusable_id: bonus.character_id, bonusable_type: 'Character')
    # end

    safety_assured do
      change_column_null :character_bonus, :bonusable_id, false
      change_column_null :character_bonus, :bonusable_type, false
      change_column_null :character_bonus, :character_id, true
    end
  end

  def down
    safety_assured do
      remove_column :character_bonus, :bonusable_id
      remove_column :character_bonus, :bonusable_type
      change_column_null :character_bonus, :character_id, false
    end
  end
end

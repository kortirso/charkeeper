class AddScopeToCharacterItems < ActiveRecord::Migration[8.0]
  def up
    add_column :character_items, :state, :integer, limit: 2, null: false, default: 1

    # Character::Item.find_each do |item|
    #   item.update!(state: item.ready_to_use? ? 1 : 2)
    # end
  end

  def down
    remove_column :character_items, :state
  end
end

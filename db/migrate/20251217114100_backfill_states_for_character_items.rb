class BackfillStatesForCharacterItems < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def up
    # default_states = Character::Item.states.keys.index_with { 0 }
    # Character::Item.in_batches(of: 1000) do |relation|
    #   relation.find_each do |item|
    #     item.update!(states: default_states.merge({ item.state => item.quantity }))
    #   end
    #   sleep(0.01) # throttle
    # end
  end

  def down; end
end

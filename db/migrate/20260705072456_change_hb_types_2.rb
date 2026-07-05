class ChangeHbTypes2 < ActiveRecord::Migration[8.1]
  def up
    Homebrew::Book::Item.where(itemable_type: 'Daggerheart::Item').update_all(itemable_type: 'Item')
    Homebrew::Book::Item.where(itemable_type: 'Dnd2024::Feat').update_all(itemable_type: 'Feat')
  end

  def down; end
end

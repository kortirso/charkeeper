class BackfillDataForDhHomebrews < ActiveRecord::Migration[8.1]
  def up
    Homebrew::Book::Item.where(itemable_type: 'Daggerheart::Homebrew::Subclass').each do |item|
      new_item = ::Daggerheart::Homebrews::Subclass.find_by(id: item.itemable_id)
      next unless new_item

      item.update(itemable_id: new_item.id, itemable_type: 'Daggerheart::Homebrews::Subclass')
    end

    Homebrew::Book::Item.where(itemable_type: 'Daggerheart::Homebrew::Race').each do |item|
      new_item = ::Daggerheart::Homebrews::Ancestry.find_by(id: item.itemable_id)
      next unless new_item

      item.update(itemable_id: new_item.id, itemable_type: 'Daggerheart::Homebrews::Ancestry')
    end

    Homebrew::Book::Item.where(itemable_type: 'Daggerheart::Homebrew::Community').each do |item|
      new_item = ::Daggerheart::Homebrews::Community.find_by(id: item.itemable_id)
      next unless new_item

      item.update(itemable_id: new_item.id, itemable_type: 'Daggerheart::Homebrews::Community')
    end
  end

  def down; end
end

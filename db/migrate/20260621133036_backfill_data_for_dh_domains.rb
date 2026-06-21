class BackfillDataForDhDomains < ActiveRecord::Migration[8.1]
  def up
    Daggerheart::Homebrew::Domain.find_each do |item|
      new_item = ::Daggerheart::Homebrews::Domain.create(
        id: item.id,
        user_id: item.user_id,
        title: { en: item.name, ru: item.name },
        public: item.public,
        discarded_at: nil,
        description: {}
      )

      item.homebrew_book_items.update_all(itemable_type: 'Daggerheart::Homebrews::Domain', itemable_id: new_item.id)
    end
  end

  def down; end
end

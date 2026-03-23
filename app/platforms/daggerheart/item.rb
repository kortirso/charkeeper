# frozen_string_literal: true

module Daggerheart
  class ItemData
    include StoreModel::Model
  end
end

module Daggerheart
  class Item < Item
    LOOT_TABLES = %w[item consumables].freeze

    attribute :data, Daggerheart::ItemData.to_type

    def self.loot(type:, dices: 1)
      dices = 6 unless dices.to_i.between?(1, 6)
      type = 'item' if LOOT_TABLES.exclude?(type)

      find_by(
        slug: Config.data('daggerheart', 'loot_tables').dig(
          type,
          Charkeeper::Container.resolve('roll').call(dice: "#{dices}d12")
        )
      )
    end
  end
end

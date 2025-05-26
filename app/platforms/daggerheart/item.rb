# frozen_string_literal: true

module Daggerheart
  class ItemData
    include StoreModel::Model
  end
end

module Daggerheart
  class Item < Item
    attribute :data, Daggerheart::ItemData.to_type
  end
end

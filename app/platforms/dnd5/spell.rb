# frozen_string_literal: true

module Dnd5
  class SpellData
    include StoreModel::Model

    attribute :level, :integer
    attribute :available_for, array: true
  end
end

module Dnd5
  class Spell < Spell
    attribute :data, Dnd5::SpellData.to_type
  end
end

# frozen_string_literal: true

module Dnd2024
  class SpellData
    include StoreModel::Model

    attribute :level, :integer
    attribute :available_for, array: true
    attribute :school, :string
    attribute :source, :string
  end
end

module Dnd2024
  class Spell < Spell
    attribute :data, Dnd2024::SpellData.to_type
  end
end

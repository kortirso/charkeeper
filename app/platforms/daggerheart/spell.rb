# frozen_string_literal: true

module Daggerheart
  class SpellData
    include StoreModel::Model

    attribute :level, :integer
    attribute :domain, :string
  end
end

module Daggerheart
  class Spell < Spell
    attribute :data, Daggerheart::SpellData.to_type
  end
end

# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class SubclassData
      include StoreModel::Model

      attribute :spellcast, :string
      attribute :mechanics, array: true, default: [] # beastform, companion, stances
    end

    class Subclass < ::Homebrew::Subclass
      include Discard::Model

      attribute :data, Daggerheart::Homebrew::SubclassData.to_type
    end
  end
end

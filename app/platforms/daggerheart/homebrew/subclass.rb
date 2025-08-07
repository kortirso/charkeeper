# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class SubclassData
      include StoreModel::Model

      attribute :spellcast, :string
    end

    class Subclass < ::Homebrew::Subclass
      attribute :data, Daggerheart::Homebrew::SubclassData.to_type
    end
  end
end

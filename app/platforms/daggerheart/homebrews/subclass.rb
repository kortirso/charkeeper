# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class SubclassData
      include StoreModel::Model

      attribute :class_id, :string
      attribute :spellcast, :string
      attribute :mechanics, array: true, default: [] # beastform, companion, stances
    end

    class Subclass < ::Homebrew
      attribute :info, Daggerheart::Homebrews::SubclassData.to_type
    end
  end
end

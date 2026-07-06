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

      def to_homebrew_json
        [
          {
            id: id,
            title: title,
            description: description,
            public: attributes['public'],
            class_id: info.class_id,
            spellcast: info.spellcast,
            mechanics: info.mechanics,
            features: Daggerheart::Feat.where(origin_value: id).map(&:to_homebrew_json)
          }
        ]
      end
    end
  end
end

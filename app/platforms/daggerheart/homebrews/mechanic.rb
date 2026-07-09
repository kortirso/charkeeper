# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class Mechanic < ::Homebrew
      has_many :items, class_name: 'Daggerheart::Homebrews::MechanicItem', foreign_key: :homebrew_id, dependent: :destroy

      def to_homebrew_json
        [
          {
            id: id,
            title: title,
            description: description,
            public: attributes['public'],
            items: items.flat_map(&:to_homebrew_json)
          }
        ]
      end
    end
  end
end

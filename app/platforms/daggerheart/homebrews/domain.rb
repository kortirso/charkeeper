# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class Domain < ::Homebrew
      def to_homebrew_json
        [
          {
            title: title,
            description: description,
            public: attributes['public'],
            features: Daggerheart::Feat.where(origin_value: id).map(&:to_homebrew_json)
          }
        ]
      end
    end
  end
end

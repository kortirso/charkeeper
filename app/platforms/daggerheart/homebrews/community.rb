# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class Community < ::Homebrew
      def to_homebrew_json
        [
          {
            id: id,
            title: title,
            description: description,
            public: attributes['public'],
            features: Daggerheart::Feat.where(origin: 'community', origin_value: id).map(&:to_homebrew_json)
          }
        ]
      end
    end
  end
end

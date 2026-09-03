# frozen_string_literal: true

module Cosmere
  module Homebrews
    class Setting < ::Homebrew
      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public']
          }.compact
        ]
      end
    end
  end
end

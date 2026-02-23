# frozen_string_literal: true

module FalloutCharacter
  module Origins
    class GhoulBuilder
      def call(result:)
        result[:tag_skills] = result[:tag_skills].push('survival').uniq

        result
      end
    end
  end
end

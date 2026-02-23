# frozen_string_literal: true

module FalloutCharacter
  module Origins
    class DwellerBuilder
      def call(result:)
        result[:tag_skill_boosts] += 1

        result
      end
    end
  end
end

# frozen_string_literal: true

module Dnd2024Character
  module Species
    class CustomBuilder
      def call(result:)
        record = Dnd2024::Homebrews::Race.find_by(id: result[:species])
        return result unless record

        result
      end
    end
  end
end

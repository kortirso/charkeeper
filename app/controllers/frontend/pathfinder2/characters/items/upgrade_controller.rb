# frozen_string_literal: true

module Frontend
  module Pathfinder2
    module Characters
      module Items
        class UpgradeController < Frontend::Characters::Items::UpgradeController
          private

          def characters_scope = Character.pathfinder2
        end
      end
    end
  end
end

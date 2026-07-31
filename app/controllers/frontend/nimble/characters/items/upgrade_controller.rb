# frozen_string_literal: true

module Frontend
  module Nimble
    module Characters
      module Items
        class UpgradeController < Frontend::Characters::Items::UpgradeController
          private

          def characters_scope = Character.nimble
        end
      end
    end
  end
end

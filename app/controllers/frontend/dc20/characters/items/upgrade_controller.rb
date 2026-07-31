# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      module Items
        class UpgradeController < Frontend::Characters::Items::UpgradeController
          private

          def characters_scope = Character.dc20
        end
      end
    end
  end
end

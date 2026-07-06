# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Feats
        class ChangeCommand < BaseCommand
          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize
            if input[:feat].origin == 'subclass' && input.key?(:subclass_mastery)
              input[:conditions] = { subclass_mastery: input[:subclass_mastery] }
            end
            if input[:feat].origin == 'domain_card'
              input[:conditions] = { level: input[:level] }
              input[:info] = { type: input[:type], recall: input[:recall] }.compact
            end

            input[:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
          end

          def do_persist(input)
            input[:feat].update!(
              input.except(:feat, :limit, :no_refresh, :subclass_mastery, :level, :attacks, :skip_contract_validation)
            )

            { result: :ok }
          end
        end
      end
    end
  end
end

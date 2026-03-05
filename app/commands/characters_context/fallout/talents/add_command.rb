# frozen_string_literal: true

module CharactersContext
  module Fallout
    module Talents
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Fallout::Character)
            required(:talent).filled(type?: ::Fallout::Feat)
            optional(:additional).filled(:bool)
          end
        end

        private

        def validate_content(input)
          input[:current_ranks] = input[:character].data.perks[input[:talent].id].to_i
          return if input[:current_ranks] < input[:talent].info['ranks']

          [I18n.t('commands.characters_context.fallout.talents.add.full_rank')]
        end

        def do_persist(input) # rubocop: disable Metrics/AbcSize
          ActiveRecord::Base.transaction do
            feat_id = input[:talent].id

            input[:character].feats.create_with(ready_to_use: true).find_or_create_by(feat_id: feat_id)
            input[:character].data.perks = input[:character].data.perks.merge(feat_id => input[:current_ranks] + 1)
            input[:character].data.perks_boosts -= 1
            input[:character].data.additional_perks += 1 if input[:additional]

            input[:talent].info['rewrite']&.each { |key, value| input[:character].data[key] = value }
            input[:talent].info['increase']&.each { |key, value| input[:character].data[key] += value }

            input[:character].save!
          end

          { result: :ok }
        end
      end
    end
  end
end

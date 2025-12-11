# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    module Talents
      class AddCommand < BaseCommand
        use_contract do
          params do
            required(:character).filled(type?: ::Dnd2024::Character)
            required(:talent).filled(type?: ::Dnd2024::Feat)
          end
        end

        private

        def do_persist(input) # rubocop: disable Metrics/AbcSize
          ActiveRecord::Base.transaction do
            feat_id = input[:talent].id

            selected_talents = input[:character].data.selected_talents
            selected_talents.key?(feat_id) ? selected_talents[feat_id] += 1 : selected_talents[feat_id] = 1
            input[:character].data.selected_talents = selected_talents
            input[:character].data.selected_feats = []

            input[:character].feats.find_or_create_by(feat_id: feat_id)
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

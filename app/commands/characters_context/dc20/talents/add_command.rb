# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Talents
      class AddCommand < BaseCommand
        include Deps[
          add_feat: 'commands.characters_context.dc20.feats.add'
        ]

        use_contract do
          params do
            required(:character).filled(type?: ::Dc20::Character)
            required(:talent).filled(type?: ::Dc20::Feat)
            optional(:feat).maybe(type?: ::Dc20::Feat)
          end
        end

        private

        def do_persist(input) # rubocop: disable Metrics/AbcSize
          ActiveRecord::Base.transaction do
            feat_id = input[:talent].id

            input[:character].feats.create_with(ready_to_use: true).find_or_create_by(feat_id: feat_id)

            selected_talents = input[:character].data.selected_talents
            selected_talents.key?(feat_id) ? selected_talents[feat_id] += 1 : selected_talents[feat_id] = 1
            input[:character].data.selected_talents = selected_talents

            input[:talent].info['rewrite']&.each { |key, value| input[:character].data[key] = value }
            input[:talent].info['increase']&.each { |key, value| input[:character].data[key] += value }

            input[:character].save!
          end

          add_feat.call({ character: input[:character], feat: input[:feat] }) if input.key?(:feat)

          { result: :ok }
        end
      end
    end
  end
end

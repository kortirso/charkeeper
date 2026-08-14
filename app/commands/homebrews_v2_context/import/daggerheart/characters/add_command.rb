# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Characters
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            refresh_feats: 'services.characters_context.daggerheart.refresh_feats'
          ]

          use_contract do
            params do
              required(:user).filled(type?: ::User)
              required(:id).filled(:string, :uuid_v4?)
              optional(:features).maybe(:array).each(:hash)
            end
          end

          private

          def do_prepare(input)
            input[:character] = input[:user].characters.daggerheart.find(input[:id])
          end

          def do_persist(input)
            input[:features]&.each do |feature|
              add_feat.call(
                feature.merge({
                  user: input[:user], origin: 'character', origin_value: input[:character].id, no_refresh: true
                })
              )
            end

            refresh_feats.call(character: input[:character])

            { result: :ok }
          end
        end
      end
    end
  end
end

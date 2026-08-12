# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class WildFormsController < Frontend::Dc20::BaseController
        include Deps[
          create_wild_form: 'commands.characters_context.dc20.wild_forms.create',
          update_wild_form: 'commands.characters_context.dc20.wild_forms.update'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_wild_forms, only: %i[index]
        before_action :find_wild_form, only: %i[update destroy]

        def index
          serialize_relation_v2(@wild_forms, ::Dc20::WildFormSerializer, :wild_forms)
        end

        def create
          case create_wild_form.call(wild_form_params.merge({ parent: @character }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result }
            serialize_resource(result, ::Dc20::WildFormSerializer, :wild_form, {}, :created)
          end
        end

        def update
          case update_wild_form.call(wild_form_params.merge({ wild_form: @wild_form }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        def destroy
          @wild_form.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params.expect(:character_id))
        end

        def find_wild_forms
          @wild_forms = @character.children.dc20_wild_form.order(created_at: :desc)
        end

        def find_wild_form
          @wild_form = @character.children.dc20_wild_form.find(params.expect(:id))
        end

        def wild_form_params
          params.require(:wild_form).permit!.to_h
        end
      end
    end
  end
end

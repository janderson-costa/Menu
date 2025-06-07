/*
	Criado por Janderson Costa em  07/01/2024.
	Descrição: Menu de contexto simples.
*/

const defaultOptions = {
	trigger: null, // HTMLElement (ex.: button | a | div)
	items: [], // [{ icon: HTMLElement, name: string, description: string, onClick: function }]
	align: 'left', // 'left' | 'right' | 'top left' | 'top right'
	top: 0, // Ajuste de posição vertical quando necessário
	onShow: null,
	onHide: null,
};
let __menu;

window.addEventListener('resize', event => {
	if (!__menu) return;

	destroy(__menu);
});

export default function Menu(options) {
	options = {
		...defaultOptions,
		...options,
	};

	let $menu;
	let _classVisible = '';
	let _classInvisible = '';

	const _context = {
		options,
		element: null,
		item: _item,
		show,
		hide,
	};

	return _context;

	function create() {
		const $menu = document.createElement('div');

		$menu.className = 'ctx-menu';
		$menu.innerHTML = /*html*/`${options.items.map(item => {
			if (item.divider) {
				return (/*html*/`
					<div class="ctx-divider"></div>
				`);
			} else {
				return (/*html*/`
					<div class="ctx-item">
						<div class="ctx-icon"></div>
						<div class="ctx-text">
							<div class="ctx-name">${item.name}</div>
							<div class="ctx-description">${item.description || ''}</div>
						</div>
					</div>
				`);
			}
		}).join('')}`;

		// Itens
		$menu.querySelectorAll(':scope > div').forEach(($item, index) => {
			const item = options.items[index];
			const icon = item.icon;

			$item.data = item;
			item.element = $item;

			// Ícone
			const $icon = $item.querySelector('.ctx-icon');

			if ($icon) {
				if (icon) {
					if (typeof icon == 'string')
						$icon.innerHTML = icon;
					else if (icon instanceof HTMLElement)
						$icon.appendChild(icon);
				} else {
					$icon.style.display = 'none';
				}
			}

			// Evento
			if (item.divider == undefined) {
				$item.addEventListener('click', event => {
					hide();

					if (item.onClick)
						item.onClick(event);
				});
			}
		});

		_context.element = $menu;
		document.body.appendChild($menu);

		return $menu;
	}

	function _item(name) {
		return {
			get,
			icon,
		};

		function get() {
			return options.items.find(x => x.name == name);
		}

		function icon(element) {
			const $item = get().element;
			const $iconPlace = $item.querySelector('.ctx-icon');

			if (element) {
				$iconPlace.innerHTML = '';
				$iconPlace.appendChild(element);
			} else if (element == '') {
				$iconPlace.innerHTML = '';
			} else {
				return $iconPlace;
			}
		}
	}

	function show(event = {}) {
		if (document.querySelector('.ctx-menu')) return;

		let x;
		let y;

		$menu = create();
		_classVisible = 'ctx-menu-visible-left';
		_classInvisible = 'ctx-menu-invisible-left';

		// Botão direito do mouse
		if (event.type == 'contextmenu') {
			event.preventDefault(); // Impede que o menu de contexto nativo do navegador seja aberto

			// Coordenadas do cursor
			x = event.x;
			y = event.y;
		}

		// Posição
		setTimeout(() => { // Para que window click não feche o menu
			if (options.trigger) {
				const trigger = options.trigger;

				// Canto inferior esquerdo do trigger
				x = trigger.offsetLeft;
				y = trigger.offsetTop + trigger.offsetHeight + 1;

				if (options.align.includes('top')) {
					// Topo do trigger
					y = trigger.offsetTop - $menu.offsetHeight - 1;
				}

				if (options.align.includes('right')) {
					// Canto direito do trigger
					x = x - $menu.offsetWidth + trigger.offsetWidth - 1;
				}
			}

			if (x + $menu.offsetWidth > window.innerWidth) {
				x = x - $menu.offsetWidth;

				_classVisible = 'ctx-menu-visible-right';
				_classInvisible = 'ctx-menu-invisible-right';
			}

			if (y + $menu.offsetHeight - window.innerHeight > 0)
				y = window.innerHeight - $menu.offsetHeight;

			$menu.className = 'ctx-menu';
			$menu.classList.add(_classVisible);
			$menu.style.left = x + 'px';
			$menu.style.top = options.top + y + 'px';

			if (options.onShow)
				options.onShow(_context);
		});

		__menu = $menu;
		window.addEventListener('click', hide);
		window.addEventListener('keyup', hide);
	}

	function hide(event) {
		if (!$menu) return;

		if (event) {
			if (!(!event.target.closest('.ctx-menu') || event.key == 'Escape'))
				return;
		}

		$menu.classList.remove(_classVisible);
		$menu.classList.add(_classInvisible);

		if (options.onHide)
			options.onHide(_context);

		setTimeout(() => destroy($menu), 200);

		window.removeEventListener('click', hide);
		window.removeEventListener('keyup', hide);
	}
};

function destroy($menu) {
	if (!$menu) return;

	$menu.remove();
	$menu = null;
}
